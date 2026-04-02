import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE = 'https://serguide.maccabi4u.co.il';
const SEARCH_URL = BASE + '/webapi/api/SearchPage/GetSearchPageSearch/';
const CATALOG_URL = BASE + '/Api/api/mac_pharmacy/v1/medications/catalog';

const BROWSER_HEADERS = {
	'Content-Type': 'application/json',
	'Origin': BASE,
	'Referer': BASE + '/heb/pharmacy/pharmacysearchresults/',
	'Accept': 'application/json, text/plain, */*',
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
};

interface CityEntry { code: string; name: string; }

interface PharmacyItem {
	CITY_NAME?: string;
	CITY_CODE?: string | number;
	[key: string]: unknown;
}

interface SearchResponse {
	Items?: PharmacyItem[];
	NumOfPages?: number;
}

interface CatalogResponse {
	results?: { largo_code: string; name: string }[];
}

async function searchDrugPharmacies(requestId: string, largoCode: string): Promise<PharmacyItem[]> {
	const results: PharmacyItem[] = [];
	let page = 1;
	while (true) {
		const res = await fetch(SEARCH_URL, {
			method: 'POST',
			headers: BROWSER_HEADERS,
			body: JSON.stringify({
				City: '',
				largo: largoCode,
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
		if (!res.ok) throw new Error(`API returned ${res.status}`);
		const data: SearchResponse = await res.json();
		const items = data.Items || [];
		results.push(...items);
		const totalPages = data.NumOfPages || 1;
		console.log(`    Page ${page}/${totalPages} — ${items.length} items`);
		if (page >= totalPages) break;
		page++;
	}
	return results;
}

async function findDrugLargo(name: string): Promise<string | null> {
	const res = await fetch(
		`${CATALOG_URL}?largo=&name=${encodeURIComponent(name)}&category=&item_state=`,
		{ headers: BROWSER_HEADERS }
	);
	const data: CatalogResponse = await res.json();
	const items = data.results || [];
	return items.length ? String(items[0].largo_code) : null;
}

async function main() {
	const requestId = crypto.randomUUID();
	console.log(`RequestId: ${requestId}\n`);

	const drugSearches = ['acamol', 'optalgin', 'advil', 'nurofen', 'adex', 'exoled', 'clavulin'];
	const seenIds = new Set<string>();
	const cityMap = new Map<string, CityEntry>();

	for (const drugName of drugSearches) {
		console.log(`Searching: ${drugName}...`);
		try {
			const largo = await findDrugLargo(drugName);
			if (!largo) { console.log('  Not found in catalog'); continue; }
			console.log(`  largo=${largo}`);

			const pharmacies = await searchDrugPharmacies(requestId, largo);
			let newCount = 0;
			for (const p of pharmacies) {
				const id = `${p.CITY_NAME}-${p.COORDINATEX}-${p.COORDINATEY}`;
				if (seenIds.has(id)) continue;
				seenIds.add(id);

				const name = (p.CITY_NAME || '').trim();
				const code = String(p.CITY_CODE || '');
				if (name && !cityMap.has(name)) {
					cityMap.set(name, { code, name });
				}
				newCount++;
			}
			console.log(`  ${pharmacies.length} pharmacies, ${newCount} new (${cityMap.size} cities total)\n`);
		} catch (err) {
			console.log(`  Failed: ${err}\n`);
		}
	}

	const cities = [...cityMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'he'));
	console.log(`\nTotal: ${cities.length} cities, ${seenIds.size} unique pharmacies`);

	const outPath = join(__dirname, '..', 'src', 'lib', 'data', 'cities.json');
	writeFileSync(outPath, JSON.stringify(cities, null, 2), 'utf-8');
	console.log(`Written to ${outPath}`);
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
