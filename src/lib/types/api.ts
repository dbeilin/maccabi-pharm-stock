export interface ApiPhone {
	Type: number;
	Title: string;
	Value: string;
}

export interface ApiDrugEntry {
	searching_largo_code: string;
	[key: string]: unknown;
}

export interface ApiPharmacyItem {
	MACABI_BRUNCH_NAME?: string;
	SERVICE_NAME?: string;
	CITY_NAME?: string;
	CITY_CODE?: string | number;
	STREET_NAME?: string;
	HOUSE_NUMBER?: string;
	COORDINATEY?: string | number;
	COORDINATEX?: string | number;
	PHONENUMBERS?: ApiPhone[];
	DRUGS_IN_STOCK?: ApiDrugEntry[];
	DRUGS_FEW_IN_STOCK?: ApiDrugEntry[];
	DRUGS_NOT_IN_STOCK?: ApiDrugEntry[];
	DRUGS_TOTAL_COUNT?: number;
	[key: string]: unknown;
}

export interface ApiSearchResponse {
	Items?: ApiPharmacyItem[];
	NumOfPages?: number;
	[key: string]: unknown;
}

export interface ApiCatalogResponse {
	results?: ApiCatalogItem[];
	[key: string]: unknown;
}

export interface ApiCatalogItem {
	largo_code: string;
	name: string;
	[key: string]: unknown;
}
