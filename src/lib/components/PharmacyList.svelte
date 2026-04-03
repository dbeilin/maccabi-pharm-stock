<script lang="ts">
	import type { Pharmacy, Drug } from '$lib/types/pharmacy';
	import PharmacyCard from './PharmacyCard.svelte';

	let {
		pharmacies = [],
		selectedDrugs = [],
		activeIndex = -1,
		isLoading = false,
		onCardClick
	}: {
		pharmacies: Pharmacy[];
		selectedDrugs: Drug[];
		activeIndex: number;
		isLoading?: boolean;
		onCardClick: (index: number) => void;
	} = $props();
</script>

<div class="pharmacy-list">
	<div class="list-header">
		תוצאות: <span class="count">{pharmacies.length}</span>
	</div>
	<div class="list-body">
		{#each pharmacies as pharmacy, i (pharmacy.name + '|' + pharmacy.lat + '|' + pharmacy.lng)}
			<PharmacyCard
				{pharmacy}
				drugs={selectedDrugs}
				isActive={activeIndex === i}
				index={i}
				onclick={onCardClick}
			/>
		{/each}
		{#if isLoading && pharmacies.length === 0}
			{#each { length: 4 } as _}
				<div class="skeleton-card">
					<div class="skeleton-line wide"></div>
					<div class="skeleton-line narrow"></div>
					<div class="skeleton-block"></div>
				</div>
			{/each}
		{:else if pharmacies.length === 0}
			<div class="empty-state">
				<svg class="empty-icon" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
					<circle cx="11" cy="11" r="8" />
					<path d="M21 21l-4.35-4.35" stroke-linecap="round" />
				</svg>
				<div>בצע חיפוש כדי לראות תוצאות</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.pharmacy-list {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.list-header {
		padding: 12px 16px;
		font-size: 0.84rem;
		font-weight: 600;
		color: var(--color-text);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.count {
		color: var(--color-primary);
		font-weight: 700;
	}

	.list-body {
		flex: 1;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		color: var(--color-text-muted);
		font-size: 0.88rem;
		gap: 12px;
		text-align: center;
	}

	.empty-icon {
		width: 48px;
		height: 48px;
		opacity: 0.35;
	}

	.skeleton-card {
		padding: 12px 14px;
		border-bottom: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.skeleton-line {
		height: 14px;
		border-radius: 6px;
		background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skeleton-line.wide {
		width: 70%;
	}

	.skeleton-line.narrow {
		width: 45%;
		height: 10px;
	}

	.skeleton-block {
		height: 40px;
		border-radius: var(--radius-sm);
		background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
		animation-delay: 0.2s;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
</style>
