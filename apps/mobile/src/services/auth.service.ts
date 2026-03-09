import { getToken, setToken } from "@/utils/store/session-store";
import { useStore } from "@/utils/store";
import { markLoginTimestamp } from "@/utils/api";

export async function login(email: string, password: string) {
  const { url, router } = useStore.getState();

  try {
    console.log("url:", url);
    console.log("Logging in with email:", email);
    const fullUrl = `${url}/session`;
    const res = await fetch(`${fullUrl}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_address: email, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();
    markLoginTimestamp();
    await setToken(data.token);

    const user = await checkSession();
    if (user && !user.onboarding_completed) {
      router?.replace("/(app)/(onboarding)/welcome");
    } else {
      router?.push("/(app)/(drawer)/(tabs)/dashboard");
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Login error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Login failed" };
  }
}

export async function checkSession() {
  // console.log("Checking session...")
  const token = await getToken();
  if (!token) return null;

  const url = useStore.getState().url;
  try {
    const res = await fetch(`${url}/user`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Session invalid");

    const data = await res.json();
    useStore.getState().setUser(data);
    if (data.preferred_currency) {
      useStore.getState().setBaseCurrency(data.preferred_currency);
    }
    return data;
  } catch {
    return null;
  }
}
