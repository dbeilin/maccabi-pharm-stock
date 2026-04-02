<script lang="ts">
	import { onMount } from 'svelte';

	import DrugSearch from '$lib/components/DrugSearch.svelte';
	import CityFilter from '$lib/components/CityFilter.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import PharmacyList from '$lib/components/PharmacyList.svelte';
	import StatusBar from '$lib/components/StatusBar.svelte';

	import { page } from '$app/state';
	import { searchPharmacies } from '$lib/api/search';
	import { CITIES, getCityCode } from '$lib/api/cities';
	import { resolveDrugNames } from '$lib/api/catalog';
	import type { Drug, Pharmacy, StatusMessage } from '$lib/types/pharmacy';
	import type { CityEntry } from '$lib/types/city';

	let selectedDrugs = $state<Drug[]>([]);
	let selectedCityNames = $state<string[]>([]);
	let pharmacies = $state<Pharmacy[]>([]);
	let status = $state<StatusMessage>({
		message: 'הקלד שם תרופה, בחר מהרשימה, ולחץ חפש',
		type: ''
	});
	let isLoading = $state(false);
	let activeIndex = $state(-1);
	let viewMode = $state<'map' | 'list'>('map');
	let urlSyncReady = $state(false);
	let controlsHeight = $state(0);

	let cityNames = $derived(CITIES.map((c: CityEntry) => c.name));

	// Per-city pharmacy count derived from current results
	let cityCounts = $derived(
		pharmacies.reduce<Record<string, number>>((acc, p) => {
			if (p.city) acc[p.city] = (acc[p.city] ?? 0) + 1;
			return acc;
		}, {})
	);

	onMount(async () => {
		await restoreFromUrl();
		urlSyncReady = true;
	});

	async function restoreFromUrl() {
		const params = page.url.searchParams;
		const drugCodes = params.get('drugs')?.split(',').filter(Boolean) ?? [];
		const cityParam = params.get('cities')?.split(',').filter(Boolean) ?? [];

		if (drugCodes.length > 0) {
			try {
				const names = await resolveDrugNames(drugCodes);
				selectedDrugs = drugCodes
					.filter((code) => names.has(code))
					.map((code) => ({ largo_code: code, name: names.get(code)! }));
			} catch {}
		}

		if (cityParam.length > 0) {
			selectedCityNames = cityParam;
		}

		if (selectedDrugs.length > 0) {
			await doSearch();
		}
	}

	$effect(() => {
		if (!urlSyncReady) return;
		const _d = selectedDrugs;
		const _c = selectedCityNames;

		const params = new URLSearchParams();
		if (_d.length) params.set('drugs', _d.map((d) => d.largo_code).join(','));
		if (_c.length) params.set('cities', _c.join(','));

		const qs = params.toString();
		const url = qs ? `?${qs}` : location.pathname;
		history.replaceState(history.state, '', url);
	});

	function addDrug(drug: Drug) {
		if (selectedDrugs.some((d) => d.largo_code === drug.largo_code)) return;
		selectedDrugs = [...selectedDrugs, drug];
	}

	function removeDrug(code: string) {
		selectedDrugs = selectedDrugs.filter((d) => d.largo_code !== code);
	}

	function toggleCity(city: string) {
		if (selectedCityNames.includes(city)) {
			selectedCityNames = selectedCityNames.filter((c) => c !== city);
		} else {
			selectedCityNames = [...selectedCityNames, city];
		}
	}

	function clearCities() {
		selectedCityNames = [];
	}

	function selectAllCities() {
		selectedCityNames = [...cityNames];
	}

	async function doSearch() {
		if (selectedDrugs.length === 0) {
			status = { message: 'יש לבחור לפחות תרופה אחת', type: 'err' };
			return;
		}

		isLoading = true;
		status = { message: 'מחפש בתי מרקחת...', type: 'loading' };

		try {
			const largoStr = selectedDrugs.map((d) => d.largo_code).join(',');
			const cityCodes = selectedCityNames
				.map((name) => getCityCode(name))
				.filter(Boolean) as string[];

			const results = await searchPharmacies(largoStr, cityCodes, (page, total) => {
				status = { message: `טוען דף ${page}/${total}...`, type: 'loading' };
			});

			pharmacies = results;
			activeIndex = -1;
			viewMode = 'list';

			status = {
				message: `נמצאו ${results.length} בתי מרקחת | תרופות: ${selectedDrugs.map((d) => d.name).join(', ')}`,
				type: 'ok'
			};
		} catch (e: unknown) {
			status = { message: e instanceof Error ? e.message : 'שגיאה לא צפויה', type: 'err' };
		} finally {
			isLoading = false;
		}
	}

	function clearAll() {
		selectedDrugs = [];
		selectedCityNames = [];
		pharmacies = [];
		activeIndex = -1;
		viewMode = 'map';
		status = { message: 'הקלד שם תרופה, בחר מהרשימה, ולחץ חפש', type: '' };
	}

	function handleMarkerClick(index: number) {
		activeIndex = index;
	}

	function handleCardClick(index: number) {
		activeIndex = index;
	}
</script>

<div class="app-shell">
	<div class="map-area">
		<MapView
			{pharmacies}
			selectedDrugs={selectedDrugs}
			activeIndex={activeIndex}
			onMarkerClick={handleMarkerClick}
		/>
	</div>

	<div class="controls-overlay" bind:clientHeight={controlsHeight}>
		<nav class="navbar">
			<span class="navbar-title">מלאי תרופות מכבי פארם</span>
			<a
				class="navbar-gh"
				href="https://github.com/dbeilin/maccabi-pharm-stock"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub repository"
			>
				<svg viewBox="0 0 16 16" aria-hidden="true">
					<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
					0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
					-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
					.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
					-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
					.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
					.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
					0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
				</svg>
			</a>
		</nav>
		<div class="controls-bar">
			<div class="controls-row">
				<div class="ctrl-drugs">
					<DrugSearch {selectedDrugs} onadd={addDrug} onremove={removeDrug} />
				</div>
				<CityFilter
					selectedCities={selectedCityNames}
					availableCities={cityNames}
					{cityCounts}
					ontoggle={toggleCity}
					onclear={clearCities}
					onselectall={selectAllCities}
				/>
				<button class="search-btn" type="button" onclick={doSearch} disabled={isLoading}>
					{isLoading ? 'מחפש...' : 'חפש'}
				</button>
				<button class="clear-btn" type="button" onclick={clearAll}>נקה</button>
			</div>
			<StatusBar {status} />
		</div>
	</div>

	{#if pharmacies.length > 0}
		<button
			class="view-toggle"
			type="button"
			onclick={() => (viewMode = viewMode === 'map' ? 'list' : 'map')}
		>
			{viewMode === 'map' ? `רשימה (${pharmacies.length})` : 'מפה'}
		</button>
	{/if}

	<div class="sidebar-overlay" class:list-mode={viewMode === 'list'} style:--controls-h="{controlsHeight}px">
		<div class="sidebar-content">
			<PharmacyList
				{pharmacies}
				selectedDrugs={selectedDrugs}
				activeIndex={activeIndex}
				onCardClick={handleCardClick}
			/>
		</div>
	</div>

</div>

<style>
	.app-shell {
		position: relative;
		width: 100vw;
		height: 100dvh;
		overflow: hidden;
	}

	.map-area {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.controls-overlay {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		z-index: 1000;
		pointer-events: none;
	}

	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		height: 44px;
		background: var(--color-primary);
		pointer-events: auto;
	}

	.navbar-title {
		font-family: var(--font-body);
		font-size: 0.95rem;
		font-weight: 700;
		color: white;
		letter-spacing: 0.01em;
	}

	.navbar-gh {
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.85);
		transition: color 0.15s;
	}

	.navbar-gh:hover {
		color: white;
	}

	.navbar-gh svg {
		width: 20px;
		height: 20px;
		fill: currentColor;
	}

	.controls-bar {
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		border-bottom: 1px solid var(--color-border);
		box-shadow: var(--shadow-card);
		pointer-events: auto;
	}

	.controls-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		flex-wrap: wrap;
	}

	.ctrl-drugs {
		flex: 2.5;
		min-width: 220px;
		background: rgba(255, 255, 255, 0.6);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 4px 10px;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.ctrl-drugs:focus-within {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(13, 115, 119, 0.12);
	}

	.search-btn {
		padding: 9px 22px;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s, transform 0.1s;
		white-space: nowrap;
	}

	.search-btn:hover:not(:disabled) {
		background: var(--color-primary-dark);
	}

	.search-btn:active:not(:disabled) {
		transform: scale(0.97);
	}

	.search-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.clear-btn {
		padding: 9px 14px;
		background: transparent;
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.85rem;
		cursor: pointer;
		transition: background 0.15s;
	}

	.clear-btn:hover {
		background: rgba(0, 0, 0, 0.04);
	}

	.view-toggle {
		display: none;
	}

	.sidebar-overlay {
		position: absolute;
		top: var(--controls-h, 0px);
		right: 0;
		bottom: 0;
		width: 370px;
		z-index: 999;
		display: flex;
		flex-direction: column;
		transform: translateX(0);
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		border-left: 1px solid var(--color-border);
		box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
	}


	@media (max-width: 767px) {
		.controls-row {
			padding: 8px 12px;
			gap: 6px;
		}

		.ctrl-drugs {
			flex: 1 1 100%;
			min-width: 0;
		}

		.view-toggle {
			display: block;
			position: fixed;
			bottom: 24px;
			left: 50%;
			transform: translateX(-50%);
			z-index: 1001;
			background: var(--color-primary);
			color: white;
			border: none;
			border-radius: 24px;
			padding: 12px 28px;
			font-family: var(--font-body);
			font-size: 0.95rem;
			font-weight: 600;
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
			cursor: pointer;
			white-space: nowrap;
		}

		.sidebar-overlay {
			position: absolute;
			top: var(--controls-h, 0px);
			left: 0;
			right: 0;
			bottom: 0;
			width: 100%;
			display: none;
			flex-direction: column;
			transform: none;
			border-radius: 0;
			z-index: 1000;
		}

		.sidebar-overlay.list-mode {
			display: flex;
		}

		.sidebar-content {
			flex: 1;
			overflow-y: auto;
			-webkit-overflow-scrolling: touch;
			border-left: none;
			box-shadow: none;
		}
	}

	@media (min-width: 768px) {
		.view-toggle {
			display: none;
		}
	}
</style>
