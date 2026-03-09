import {
  AppRequestError,
  ensureOk,
  fetchApi,
  fetchJsonWithAuth,
  fetchWithAuth,
  getErrorMessage,
} from "../api";
import { useStore } from "../store";

// Mock session-store
jest.mock("../store/session-store", () => ({
  getToken: jest.fn(async () => "test-token"),
  setToken: jest.fn(),
  deleteToken: jest.fn(),
}));

describe("fetchWithAuth", () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    // Set up store state
    useStore.setState({
      url: "http://localhost:2999",
      logout: mockLogout,
    } as any);

    // Mock global fetch
    global.fetch = jest.fn();
  });

  test("given a relative path, prepends base url from store", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      ok: true,
    });

    await fetchWithAuth("/accounts");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/accounts",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  test("given init headers, merges with auth header", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      ok: true,
    });

    await fetchWithAuth("/accounts", {
      headers: { "Content-Type": "application/json" },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/accounts",
      expect.objectContaining({
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      }),
    );
  });

  test("given 401 response, calls logout and throws", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 401,
      ok: false,
    });

    await expect(fetchWithAuth("/accounts")).rejects.toThrow("Unauthorized");
    expect(mockLogout).toHaveBeenCalled();
  });

  test("given successful response, returns the response", async () => {
    const mockResponse = { status: 200, ok: true, json: jest.fn() };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await fetchWithAuth("/accounts");

    expect(result).toBe(mockResponse);
  });

  test("given POST method, passes through to fetch", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ status: 200, ok: true });

    await fetchWithAuth("/accounts", {
      method: "POST",
      body: JSON.stringify({ name: "test" }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/accounts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "test" }),
      }),
    );
  });
});

describe("fetchApi", () => {
  beforeEach(() => {
    useStore.setState({ url: "http://localhost:2999" } as any);
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  test("given a relative path, prepends base url from store", async () => {
    await fetchApi("/session");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/session",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  test("given custom headers, merges with Content-Type", async () => {
    await fetchApi("/session", {
      headers: { "X-Custom": "value" },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:2999/session",
      expect.objectContaining({
        headers: {
          "X-Custom": "value",
          "Content-Type": "application/json",
        },
      }),
    );
  });

  test("does not include Authorization header", async () => {
    await fetchApi("/session");

    const callHeaders = (global.fetch as jest.Mock).mock.calls[0][1].headers;
    expect(callHeaders).not.toHaveProperty("Authorization");
  });
});

describe("fetchJsonWithAuth", () => {
  beforeEach(() => {
    useStore.setState({
      url: "http://localhost:2999",
      logout: jest.fn(),
    } as any);
    global.fetch = jest.fn();
  });

  test("turns HTML server failures into friendly server errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      headers: {
        get: jest.fn().mockReturnValue("text/html"),
      },
    });

    await expect(fetchJsonWithAuth("/dashboard")).rejects.toMatchObject({
      code: "server",
      message: "The server is unavailable right now. Please try again shortly.",
    });
  });

  test("turns invalid JSON into invalid-response errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: jest.fn().mockReturnValue("application/json"),
      },
      json: jest.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
    });

    await expect(fetchJsonWithAuth("/dashboard")).rejects.toMatchObject({
      code: "invalid-response",
    });
  });

  test("turns network failures into retryable app errors", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new TypeError("Network request failed"),
    );

    await expect(fetchJsonWithAuth("/dashboard")).rejects.toMatchObject({
      code: "network",
      retryable: true,
    });
  });
});

describe("getErrorMessage", () => {
  test("returns friendly copy for server failures", () => {
    expect(
      getErrorMessage(
        new AppRequestError("boom", { code: "server", status: 500 }),
      ),
    ).toContain("backend is having trouble");
  });
});

describe("ensureOk", () => {
  test("keeps successful responses unchanged", async () => {
    const response = {
      ok: true,
      headers: { get: jest.fn().mockReturnValue("application/json") },
    } as any;

    await expect(ensureOk(response)).resolves.toBe(response);
  });
});
