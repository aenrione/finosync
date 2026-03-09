import { useStore } from "@/utils/store";

import { getToken } from "./store/session-store";

let lastLoginTimestamp = 0;

export type AppRequestErrorCode =
  | "network"
  | "timeout"
  | "unauthorized"
  | "server"
  | "http"
  | "invalid-response"
  | "unknown";

type AppRequestErrorOptions = {
  code: AppRequestErrorCode;
  status?: number;
  cause?: unknown;
};

const REQUEST_TIMEOUT_MS = 15000;

export class AppRequestError extends Error {
  code: AppRequestErrorCode;
  status?: number;
  retryable: boolean;

  constructor(message: string, options: AppRequestErrorOptions) {
    super(message);
    this.name = "AppRequestError";
    this.code = options.code;
    this.status = options.status;
    this.cause = options.cause;
    this.retryable =
      options.code === "network" ||
      options.code === "timeout" ||
      options.code === "server";
  }
}

function getFullUrl(input: RequestInfo) {
  const { url } = useStore.getState();
  return typeof input === "string" ? `${url}${input}` : input;
}

function mergeHeaders(init?: RequestInit, headers?: Record<string, string>) {
  return {
    ...(init?.headers || {}),
    ...(headers || {}),
  };
}

async function request(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const fullUrl = getFullUrl(input);

    return await fetch(fullUrl, {
      ...init,
      signal: init?.signal ?? controller.signal,
    });
  } catch (error) {
    throw normalizeRequestError(error);
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeRequestError(error: unknown): AppRequestError {
  if (error instanceof AppRequestError) return error;

  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return new AppRequestError("Request timed out. Please try again.", {
        code: "timeout",
        cause: error,
      });
    }

    return new AppRequestError(
      "We couldn't reach the server. Check your connection and try again.",
      {
        code: "network",
        cause: error,
      },
    );
  }

  return new AppRequestError(
    "Something went wrong while contacting the server.",
    {
      code: "unknown",
      cause: error,
    },
  );
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new AppRequestError("The server returned an invalid response.", {
      code: "invalid-response",
      status: response.status,
      cause: error,
    });
  }
}

export async function getResponseData<T>(response: Response): Promise<T> {
  const data = await parseResponseBody(response);

  if (data === null) {
    throw new AppRequestError("The server returned an unexpected response.", {
      code: "invalid-response",
      status: response.status,
    });
  }

  return data as T;
}

export async function ensureOk(response: Response): Promise<Response> {
  if (response.ok) return response;

  const data = await parseResponseBody(response);
  const serverMessage =
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
      ? data.error
      : null;

  if (response.status === 401) {
    throw new AppRequestError(serverMessage || "Unauthorized", {
      code: "unauthorized",
      status: response.status,
    });
  }

  if (response.status >= 500) {
    throw new AppRequestError(
      serverMessage ||
        "The server is unavailable right now. Please try again shortly.",
      {
        code: "server",
        status: response.status,
      },
    );
  }

  throw new AppRequestError(
    serverMessage || `HTTP ${response.status}: ${response.statusText}`,
    {
      code: "http",
      status: response.status,
    },
  );
}

export async function fetchJsonWithAuth<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const response = await fetchWithAuth(input, init);
  await ensureOk(response);
  return getResponseData<T>(response);
}

export async function fetchJsonApi<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const response = await fetchApi(input, init);
  await ensureOk(response);
  return getResponseData<T>(response);
}

export function getErrorTitle(
  error: unknown,
  fallback = "Couldn't load this screen",
) {
  if (error instanceof AppRequestError) {
    switch (error.code) {
      case "network":
      case "timeout":
        return "You're offline";
      case "server":
        return "Server unavailable";
      case "invalid-response":
        return "Unexpected response";
      case "unauthorized":
        return "Session expired";
      default:
        return fallback;
    }
  }

  return fallback;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (error instanceof AppRequestError) {
    switch (error.code) {
      case "network":
        return "We can't reach the backend right now. Check your connection or try again in a moment.";
      case "timeout":
        return "The request took too long. Try again when the connection is more stable.";
      case "server":
        return "The backend is having trouble right now. We'll keep showing your last synced data when available.";
      case "invalid-response":
        return "The server responded in an unexpected format. Please try again in a moment.";
      case "unauthorized":
        return "Your session expired. Please sign in again.";
      default:
        return error.message || fallback;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function isRetryableError(error: unknown) {
  return error instanceof AppRequestError ? error.retryable : true;
}

export function markLoginTimestamp() {
  lastLoginTimestamp = Date.now();
}

export async function fetchWithAuth(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const { logout } = useStore.getState();
  const token = await getToken();

  // Skip request if there's no token — the user isn't logged in yet
  if (!token) {
    throw new AppRequestError("No auth token", { code: "unauthorized" });
  }

  const response = await request(input, {
    ...init,
    headers: mergeHeaders(init, {
      Authorization: `Bearer ${token}`,
    }),
  });

  if (response.status === 401) {
    // Grace period after login — stale requests from before login may 401
    const timeSinceLogin = Date.now() - lastLoginTimestamp;
    if (timeSinceLogin < 3000) {
      throw new AppRequestError("Unauthorized", {
        code: "unauthorized",
        status: response.status,
      });
    }

    console.warn("Unauthorized (401) - logging out user.");
    logout();
    throw new AppRequestError("Unauthorized", {
      code: "unauthorized",
      status: response.status,
    });
  }

  return response;
}

export async function fetchApi(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  return request(input, {
    ...init,
    headers: mergeHeaders(init, {
      "Content-Type": "application/json",
    }),
  });
}
