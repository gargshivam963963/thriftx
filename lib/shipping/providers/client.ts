import { getShiprocketToken } from "./auth";

/**
 * Small retry helper with backoff.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If we get a 401, the caller handles re-auth and retries once.
      if (response.status === 401) {
        return response;
      }

      // Retry on transient network / 5xx errors (except 401 handled above).
      if (response.status >= 500 && attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 400 * (attempt + 1)),
        );
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 400 * (attempt + 1)),
        );
        continue;
      }
    }
  }

  throw lastError;
}

export async function shiprocketFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let token = await getShiprocketToken();

  const buildRequest = (authToken: string): RequestInit => ({
    ...options,
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  let response = await fetchWithRetry(
    `https://apiv2.shiprocket.in/v1/external${endpoint}`,
    buildRequest(token),
    2,
  );

  // Token may have expired — refresh once and retry.
  if (response.status === 401) {
    token = await getShiprocketToken();
    response = await fetch(
      `https://apiv2.shiprocket.in/v1/external${endpoint}`,
      buildRequest(token),
    );
  }

  if (!response.ok) {
    const error = await response.text().catch(() => "");
    throw new Error(
      `Shiprocket API error (${response.status}) for ${endpoint}: ${error}`,
    );
  }

  return response.json();
}
