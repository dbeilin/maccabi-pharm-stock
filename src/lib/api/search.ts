import { SEARCH_URL, createRequestId, apiFetch } from './client';
import { normalizePharmacy } from '$lib/utils/normalize';
import type { ApiSearchResponse } from '$lib/types/api';
import type { Pharmacy } from '$lib/types/pharmacy';

type ProgressCallback = (page: number, total: number) => void;

const inFlight = new Map<string, Promise<Pharmacy[]>>();

export async function searchPharmacies(
	largoStr: string,
	cityCodes: string[] = [],
	onProgress?: ProgressCallback
): Promise<Pharmacy[]> {
	const key = largoStr + '|' + [...cityCodes].sort().join(',');

	if (inFlight.has(key)) return inFlight.get(key)!;

	const promise = runSearch(largoStr, cityCodes, onProgress).finally(() =>
		inFlight.delete(key)
	);

	inFlight.set(key, promise);
	return promise;
}

async function runSearch(
	largoStr: string,
	cityCodes: string[],
	onProgress?: ProgressCallback
): Promise<Pharmacy[]> {
	const requestId = createRequestId();
	const results: Pharmacy[] = [];

	const cityParam = cityCodes.length === 1 ? cityCodes[0] : '';

	if (cityCodes.length <= 1) {
		await fetchAllPages(requestId, largoStr, cityParam, results, onProgress);
	} else {
		for (const cityCode of cityCodes) {
			await fetchAllPages(requestId, largoStr, cityCode, results, onProgress);
		}
	}

	// Deduplicate by stable key: same name + coordinates
	const seen = new Set<string>();
	return results.filter((p) => {
		const key = `${p.name}|${p.lat}|${p.lng}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

async function fetchAllPages(
	requestId: string,
	largoStr: string,
	cityCode: string,
	results: Pharmacy[],
	onProgress?: ProgressCallback
): Promise<void> {
	let page = 1;

	while (true) {
		const data = await apiFetch<ApiSearchResponse>(SEARCH_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				City: cityCode,
				largo: largoStr,
				ChapterId: '006',
				InitiatorCode: '001',
				isKosher: 0,
				IsMobileApplication: 0,
				PageNumber: page,
				RequestId: requestId,
				Source: 'SearchPage',
				ModuleName: 'pharmacysearchresults'
			})
		});

		const items = data.Items || [];
		results.push(...items.map(normalizePharmacy));

		const totalPages = data.NumOfPages || 1;
		onProgress?.(page, totalPages);
		if (page >= totalPages) break;
		page++;
	}
}
