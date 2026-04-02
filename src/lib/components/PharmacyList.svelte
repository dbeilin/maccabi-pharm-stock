<script lang="ts">
	import type { Pharmacy, Drug } from '$lib/types/pharmacy';
	import PharmacyCard from './PharmacyCard.svelte';

	let {
		pharmacies = [],
		selectedDrugs = [],
		activeIndex = -1,
		onCardClick
	}: {
		pharmacies: Pharmacy[];
		selectedDrugs: Drug[];
		activeIndex: number;
		onCardClick: (index: number) => void;
	} = $props();
</script>

<div class="pharmacy-list">
	<div class="list-header">
		תוצאות: <span class="count">{pharmacies.length}</span>
	</div>
	<div class="list-body">
		{#each pharmacies as pharmacy, i (i)}
			<PharmacyCard
				{pharmacy}
				drugs={selectedDrugs}
				isActive={activeIndex === i}
				index={i}
				onclick={onCardClick}
			/>
		{/each}
		{#if pharmacies.length === 0}
			<div class="empty-state">
				<div class="empty-icon">&#8982;</div>
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
		font-size: 2.5rem;
		opacity: 0.4;
	}
</style>
