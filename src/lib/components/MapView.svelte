<script lang="ts">
	import { onMount } from 'svelte';
	import type { Pharmacy, Drug } from '$lib/types/pharmacy';
	import { worstStockColor, drugStockStatus, STOCK_COLORS, STOCK_LABELS } from '$lib/utils/normalize';
	import { esc } from '$lib/utils/esc';

	let {
		pharmacies = [],
		selectedDrugs = [],
		activeIndex = -1,
		onMarkerClick
	}: {
		pharmacies: Pharmacy[];
		selectedDrugs: Drug[];
		activeIndex: number;
		onMarkerClick?: (index: number) => void;
	} = $props();

	let mapEl: HTMLDivElement;
	let map: any = $state.raw(null);
	let L: any = $state.raw(null);
	let markersLayer: any = $state.raw(null);
	let markersMap: Map<number, any> = new Map();

	onMount(async () => {
		const leaflet = await import('leaflet');
		L = leaflet;

		map = L.map(mapEl, {
			center: [31.7, 35.1],
			zoom: 8,
			zoomControl: false
		});

		L.control.zoom({ position: 'bottomleft' }).addTo(map);

		L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 19
		}).addTo(map);

		markersLayer = L.layerGroup().addTo(map);
	});

	$effect(() => {
		if (!map || !L || !markersLayer) return;
		markersLayer.clearLayers();
		markersMap.clear();

		const currentPharmacies = pharmacies;
		const currentDrugs = selectedDrugs;
		const bounds: [number, number][] = [];

		currentPharmacies.forEach((p, i) => {
			if (!p.lat || !p.lng || isNaN(p.lat) || isNaN(p.lng)) return;

			const color = worstStockColor(p);
			const marker = L.circleMarker([p.lat, p.lng], {
				radius: 11,
				fillColor: color,
				color: '#fff',
				weight: 2.5,
				opacity: 1,
				fillOpacity: 0.9
			}).addTo(markersLayer);

			marker.bindPopup(buildPopup(p, currentDrugs), { maxWidth: 290 });
			marker.on('click', () => onMarkerClick?.(i));
			markersMap.set(i, marker);
			bounds.push([p.lat, p.lng]);
		});

		if (bounds.length) {
			map.fitBounds(bounds, { padding: [50, 50] });
		}
	});

	$effect(() => {
		if (!map) return;
		const idx = activeIndex;

		markersMap.forEach((m) => m.closePopup());

		const marker = markersMap.get(idx);
		if (marker) {
			map.panTo(marker.getLatLng(), { animate: true, duration: 0.4 });
			setTimeout(() => marker.openPopup(), 300);
		}
	});

	const popupLabels: Record<string, string> = {
		in: 'במלאי',
		few: 'חלקי',
		out: 'אין',
		unknown: '?'
	};

	function buildPopup(p: Pharmacy, drugs: Drug[]): string {
		const addr = [p.street, p.houseNum, p.city].filter(Boolean).join(' ');
		const phone = p.phones.length
			? `<div class="popup-phone">${p.phones.map((ph) => esc(ph)).join(', ')}</div>`
			: '';

		const drugRows = drugs
			.map((d) => {
				const status = drugStockStatus(p, d.largo_code);
				const color = STOCK_COLORS[status];
				const label = popupLabels[status];
				return `<div class="popup-drug-row">
					<div class="popup-drug-name" dir="ltr">${esc(d.name)}</div>
					<div class="popup-drug-status">
						<span class="popup-dot" style="background:${color}"></span>
						<span class="popup-badge" style="color:${color};background:${color}22">${label}</span>
					</div>
				</div>`;
			})
			.join('');

		return `<div class="popup-wrap" dir="rtl" lang="he">
			<div class="popup-name">${esc(p.name)}</div>
			<div class="popup-addr">${esc(addr)}</div>
			${phone}
			<div class="popup-drugs">${drugRows}</div>
		</div>`;
	}
</script>

<div class="map-container" bind:this={mapEl}></div>

<style>
	.map-container {
		width: 100%;
		height: 100%;
	}

	:global(.leaflet-popup-content-wrapper) {
		direction: rtl;
	}
	:global(.popup-wrap) {
		max-width: 270px;
		direction: rtl;
		font-family: 'Heebo', sans-serif;
		text-align: right;
	}
	:global(.popup-wrap .popup-name) {
		font-size: 0.95rem;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 4px;
		text-align: right;
	}
	:global(.popup-wrap .popup-addr) {
		font-size: 0.8rem;
		color: #555555;
		margin-bottom: 4px;
		text-align: right;
	}
	:global(.popup-wrap .popup-phone) {
		font-size: 0.8rem;
		color: #444;
		margin-bottom: 8px;
		text-align: right;
	}
	:global(.popup-wrap .popup-drugs) {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 2px;
	}
	:global(.popup-wrap .popup-drug-row) {
		display: flex;
		flex-direction: column;
		gap: 3px;
		background: rgba(0, 0, 0, 0.03);
		border-radius: 6px;
		padding: 6px 8px;
	}
	:global(.popup-wrap .popup-drug-name) {
		font-size: 0.78rem;
		color: #333;
		font-weight: 500;
		letter-spacing: 0.01em;
		text-align: left;
	}
	:global(.popup-wrap .popup-drug-status) {
		display: flex;
		align-items: center;
		gap: 5px;
		direction: rtl;
	}
	:global(.popup-wrap .popup-dot) {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		flex-shrink: 0;
		display: inline-block;
	}
	:global(.popup-wrap .popup-badge) {
		font-size: 0.72rem;
		font-weight: 700;
		padding: 1px 7px;
		border-radius: 10px;
	}
</style>
