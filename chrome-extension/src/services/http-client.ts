const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.status = status;
  }
}

export const httpGet = async <T>(path: string, params?: Record<string, string>): Promise<T> => {
  const url = new URL(path, BASE_URL);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  return response.json() as Promise<T>;
};
