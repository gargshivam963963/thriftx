interface ShiprocketAuthResponse {
  token: string;
}

let cachedToken: string | null = null;
let expiresAt = 0;

export async function getShiprocketToken(): Promise<string> {
  if (cachedToken && Date.now() < expiresAt) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials are missing.");
  }

  const response = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Unable to authenticate with Shiprocket.");
  }

  const data = (await response.json()) as ShiprocketAuthResponse;

  cachedToken = data.token;

  // Shiprocket token is valid for several days.
  // Refresh slightly earlier.
  expiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;

  return cachedToken;
}
