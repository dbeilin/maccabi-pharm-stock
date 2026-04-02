import { CATALOG_URL, apiFetch } from './client';
import type { ApiCatalogResponse, ApiCatalogItem } from '$lib/types/api';
import type { CatalogItem } from '$lib/types/pharmacy';

export async function searchCatalog(query: string): Promise<CatalogItem[]> {
	if (query.length < 2) return [];

	const data = await apiFetch<ApiCatalogResponse>(
		`${CATALOG_URL}?largo=&name=${encodeURIComponent(query)}&category=&item_state=`
	);

	return (data.results || []).map((item: ApiCatalogItem) => ({
		largo_code: String(item.largo_code),
		name: item.name
	}));
}

export async function resolveDrugNames(codes: string[]): Promise<Map<string, string>> {
	const map = new Map<string, string>();

	const cached = loadDrugCache();
	for (const code of codes) {
		if (cached.has(code)) {
			map.set(code, cached.get(code)!);
		}
	}

	const unresolved = codes.filter((c) => !map.has(c));
	if (unresolved.length === 0) return map;

	const results = await Promise.allSettled(
		unresolved.map((code) =>
			apiFetch<ApiCatalogResponse>(
				`${CATALOG_URL}?largo=${encodeURIComponent(code)}&name=&category=&item_state=`
			)
		)
	);

	for (let i = 0; i < results.length; i++) {
		const result = results[i];
		if (result.status === 'fulfilled' && result.value.results?.length) {
			const item = result.value.results[0];
			const code = unresolved[i];
			map.set(code, item.name);
			cached.set(code, item.name);
		}
	}

	saveDrugCache(cached);
	return map;
}

const DRUG_CACHE_KEY = 'maccabi_drug_cache';
const DRUG_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry {
	name: string;
	ts: number;
}

function loadDrugCache(): Map<string, string> {
	try {
		const raw = localStorage.getItem(DRUG_CACHE_KEY);
		if (!raw) return new Map();
		const parsed: Record<string, CacheEntry> = JSON.parse(raw);
		const now = Date.now();
		const map = new Map<string, string>();
		for (const [code, entry] of Object.entries(parsed)) {
			if (now - entry.ts < DRUG_CACHE_TTL) {
				map.set(code, entry.name);
			}
		}
		return map;
	} catch {
		return new Map();
	}
}

function saveDrugCache(map: Map<string, string>): void {
	try {
		const obj: Record<string, CacheEntry> = {};
		const now = Date.now();
		for (const [code, name] of map) {
			obj[code] = { name, ts: now };
		}
		localStorage.setItem(DRUG_CACHE_KEY, JSON.stringify(obj));
	} catch {}
}
