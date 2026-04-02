export interface Drug {
	largo_code: string;
	name: string;
}

export type StockStatus = 'in' | 'few' | 'out' | 'unknown';

export interface ApiDrugRef {
	searching_largo_code: string;
	[key: string]: unknown;
}

export interface Pharmacy {
	name: string;
	city: string;
	cityCode: string;
	street: string;
	houseNum: string;
	lat: number;
	lng: number;
	phones: string[];
	inStock: ApiDrugRef[];
	fewStock: ApiDrugRef[];
	notStock: ApiDrugRef[];
	total: number;
}

export interface StatusMessage {
	message: string;
	type: 'loading' | 'ok' | 'err' | '';
}

export interface CatalogItem {
	largo_code: string;
	name: string;
	[key: string]: unknown;
}
