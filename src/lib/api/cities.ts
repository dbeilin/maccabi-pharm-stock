import type { CityEntry } from '$lib/types/city';
import citiesData from '$lib/data/cities.json';

export const CITIES: CityEntry[] = citiesData;

export function getCityCode(name: string): string | undefined {
	return CITIES.find((c) => c.name === name)?.code;
}

export function getCityName(code: string): string | undefined {
	return CITIES.find((c) => c.code === code)?.name;
}
