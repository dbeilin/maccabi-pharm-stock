import type { ApiPharmacyItem } from '$lib/types/api';
import type { Pharmacy, StockStatus } from '$lib/types/pharmacy';

export function normalizePharmacy(item: ApiPharmacyItem): Pharmacy {
	return {
		name: item.MACABI_BRUNCH_NAME || item.SERVICE_NAME || '',
		city: item.CITY_NAME || '',
		cityCode: item.CITY_CODE ? String(item.CITY_CODE) : '',
		street: item.STREET_NAME || '',
		houseNum: item.HOUSE_NUMBER || '',
		lat: parseFloat(String(item.COORDINATEY)),
		lng: parseFloat(String(item.COORDINATEX)),
		phones: (item.PHONENUMBERS || [])
			.filter((p) => p.Type === 2 && p.Title !== 'פקס')
			.map((p) => p.Value),
		inStock: item.DRUGS_IN_STOCK || [],
		fewStock: item.DRUGS_FEW_IN_STOCK || [],
		notStock: item.DRUGS_NOT_IN_STOCK || [],
		total: item.DRUGS_TOTAL_COUNT || 0
	};
}

export function worstStockColor(p: Pharmacy): string {
	if (!p.total) return '#8E8E8E';
	if (p.notStock.length > 0) return '#C93B3B';
	if (p.fewStock.length > 0) return '#D4930D';
	if (p.inStock.length > 0) return '#2D9F4C';
	return '#8E8E8E';
}

export function drugStockStatus(p: Pharmacy, largoCode: string): StockStatus {
	const code = String(largoCode);
	if (p.inStock.some((d) => String(d.searching_largo_code) === code)) return 'in';
	if (p.fewStock.some((d) => String(d.searching_largo_code) === code)) return 'few';
	if (p.notStock.some((d) => String(d.searching_largo_code) === code)) return 'out';
	return 'unknown';
}
