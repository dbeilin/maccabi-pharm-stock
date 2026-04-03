<script lang="ts">
	import type { Pharmacy, Drug, StockStatus } from '$lib/types/pharmacy';
	import { drugStockStatus, STOCK_LABELS } from '$lib/utils/normalize';

	let {
		pharmacy,
		drugs = [],
		isActive = false,
		index = 0,
		onclick
	}: {
		pharmacy: Pharmacy;
		drugs: Drug[];
		isActive: boolean;
		index: number;
		onclick: (index: number) => void;
	} = $props();

	const statusMeta: Record<StockStatus, { cls: string; label: string }> = {
		in: { cls: 'dot-in', label: STOCK_LABELS.in },
		few: { cls: 'dot-few', label: STOCK_LABELS.few },
		out: { cls: 'dot-out', label: STOCK_LABELS.out },
		unknown: { cls: 'dot-unknown', label: STOCK_LABELS.unknown }
	};
</script>

<div
	class="pharm-card"
	class:active={isActive}
	onclick={() => onclick(index)}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && onclick(index)}
>
	<div class="pharm-header">
		<div class="pharm-name" dir="auto">{pharmacy.name}</div>
		<div class="pharm-addr" dir="auto">
			{#if pharmacy.street}
				{pharmacy.street} {pharmacy.houseNum}, {pharmacy.city}
			{:else}
				{pharmacy.city}
			{/if}
		</div>
	</div>

	{#if drugs.length > 0}
		<div class="drug-table">
			{#each drugs as drug (drug.largo_code)}
				{@const status = drugStockStatus(pharmacy, drug.largo_code)}
				{@const meta = statusMeta[status]}
				<div class="drug-row">
					<span class="status-dot {meta.cls}" title={meta.label}></span>
					<span class="drug-name" dir="auto">{drug.name}</span>
					<span class="drug-status {status}">{meta.label}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.pharm-card {
		padding: 12px 14px;
		border-bottom: 1px solid var(--color-border);
		cursor: pointer;
		transition: background var(--transition-fast);
		border-left: 3px solid transparent;
	}

	.pharm-card:hover {
		background: rgba(13, 115, 119, 0.04);
	}

	.pharm-card.active {
		background: rgba(13, 115, 119, 0.08);
		border-left-color: var(--color-primary);
	}

	.pharm-header {
		margin-bottom: 8px;
	}

	.pharm-name {
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--color-text);
		line-height: 1.3;
	}

	.pharm-addr {
		font-size: 0.76rem;
		color: var(--color-text-muted);
		margin-top: 2px;
		line-height: 1.4;
	}

	.drug-table {
		display: flex;
		flex-direction: column;
		gap: 5px;
		background: rgba(0, 0, 0, 0.02);
		border-radius: var(--radius-sm);
		padding: 8px 10px;
	}

	.drug-row {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.78rem;
		min-height: 22px;
	}

	.status-dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.dot-in {
		background: var(--color-stock-in);
		animation: pulse-green 2s ease-in-out infinite;
	}
	.dot-few {
		background: var(--color-stock-few);
	}
	.dot-out {
		background: var(--color-stock-out);
	}
	.dot-unknown {
		background: var(--color-stock-unknown);
	}

	.drug-name {
		flex: 1;
		color: var(--color-text);
		text-align: start;
		line-height: 1.3;
	}

	.drug-status {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 1px 7px;
		border-radius: 10px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.drug-status.in {
		background: rgba(45, 159, 76, 0.12);
		color: var(--color-stock-in);
	}
	.drug-status.few {
		background: rgba(212, 147, 13, 0.12);
		color: var(--color-stock-few-text);
	}
	.drug-status.out {
		background: rgba(201, 59, 59, 0.12);
		color: var(--color-stock-out);
	}
	.drug-status.unknown {
		background: rgba(142, 142, 142, 0.12);
		color: var(--color-stock-unknown);
	}

	@keyframes pulse-green {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(45, 159, 76, 0.4);
		}
		50% {
			box-shadow: 0 0 0 4px rgba(45, 159, 76, 0);
		}
	}
</style>
