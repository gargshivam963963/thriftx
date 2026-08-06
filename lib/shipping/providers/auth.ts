interface ShiprocketAuthResponse {
  token: string;
}

let cachedToken: string | null = null;
let expiresAt = 0;

export interface ShiprocketConfig {
  email: string;
  password: string;
}

/**
 * Check whether Shiprocket credentials are configured.
 * Used to gracefully fall back to preset rates when not set up.
 */
export function isShiprocketConfigured(): boolean {
  return Boolean(
    process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD,
  );
}

/**
 * Read the Shiprocket credentials from the environment.
 */
export function getShiprocketConfig(): ShiprocketConfig {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Shiprocket credentials are missing. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in your environment.",
    );
  }

  return { email, password };
}

export async function getShiprocketToken(): Promise<string> {
  if (cachedToken && Date.now() < expiresAt) {
    return cachedToken;
  }

  const { email, password } = getShiprocketConfig();

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
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Unable to authenticate with Shiprocket (${response.status}). ${errorBody}`,
    );
  }

  const data = (await response.json()) as ShiprocketAuthResponse;

  if (!data.token) {
    throw new Error("Shiprocket returned an empty token.");
  }

  cachedToken = data.token;

  // Shiprocket token is valid for several days.
  // Refresh slightly earlier.
  expiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;

  return cachedToken;
}
