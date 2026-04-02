const BASE = 'https://serguide.maccabi4u.co.il';

export const SEARCH_URL = BASE + '/webapi/api/SearchPage/GetSearchPageSearch/';
export const CATALOG_URL = BASE + '/Api/api/mac_pharmacy/v1/medications/catalog';

export function createRequestId(): string {
	return crypto.randomUUID();
}

const API_TIMEOUT = 15_000;
const API_RETRIES = 2;

export class ApiError extends Error {
	constructor(
		message: string,
		public status?: number
	) {
		super(message);
		this.name = 'ApiError';
	}
}

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
	let lastError: ApiError | undefined;

	for (let attempt = 0; attempt <= API_RETRIES; attempt++) {
		if (attempt > 0) {
			await sleep(1000 * attempt);
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

		try {
			const res = await fetch(url, {
				...options,
				signal: controller.signal
			});

			if (!res.ok) {
				throw new ApiError(
					`שגיאת שרת (${res.status}). נסה שוב מאוחר יותר.`,
					res.status
				);
			}

			const data = await res.json();
			return data as T;
		} catch (err) {
			clearTimeout(timeout);
			if (err instanceof ApiError) {
				// Don't retry HTTP errors (4xx/5xx) — they won't resolve on retry
				if (err.status !== undefined) throw err;
				lastError = err;
			} else if (err instanceof DOMException && err.name === 'AbortError') {
				lastError = new ApiError('הבקשה ארכה יותר מדי זמן. נסה שוב.');
			} else if (err instanceof TypeError) {
				lastError = new ApiError('שגיאת רשת. בדוק את החיבור לאינטרנט.');
			} else {
				lastError = new ApiError('שגיאה לא צפויה. נסה שוב.');
			}
		} finally {
			clearTimeout(timeout);
		}
	}

	throw lastError ?? new ApiError('שגיאה לא צפויה. נסה שוב.');
}
