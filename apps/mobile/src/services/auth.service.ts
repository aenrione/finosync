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

    await checkSession();
    router?.push("/(app)/(drawer)/(tabs)/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
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
    return data;
  } catch {
    return null;
  }
}
