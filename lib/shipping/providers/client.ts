import { getShiprocketToken } from "./auth";

export async function shiprocketFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getShiprocketToken();

  const response = await fetch(
    `https://apiv2.shiprocket.in/v1/external${endpoint}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(error);
  }

  return response.json();
}
