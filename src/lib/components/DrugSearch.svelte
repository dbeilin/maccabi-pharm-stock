<script lang="ts">
	import type { Drug } from '$lib/types/pharmacy';
	import type { CatalogItem } from '$lib/types/pharmacy';
	import { searchCatalog } from '$lib/api/catalog';

	let {
		selectedDrugs = [],
		onadd,
		onremove
	}: {
		selectedDrugs: Drug[];
		onadd: (drug: Drug) => void;
		onremove: (code: string) => void;
	} = $props();

	let query = $state('');
	let acItems = $state<CatalogItem[]>([]);
	let acOpen = $state(false);
	let acSelectedIndex = $state(0);
	let acTimer: ReturnType<typeof setTimeout>;
	let drugInput: HTMLInputElement;
	let drugBox: HTMLDivElement;
	let acListId = 'drug-ac-list';

	const filteredAcItems = $derived(
		acItems.filter(
			(item) => !selectedDrugs.some((d) => String(d.largo_code) === String(item.largo_code))
		)
	);

	function onInput() {
		clearTimeout(acTimer);
		if (query.trim().length < 2) {
			acOpen = false;
			acItems = [];
			return;
		}
		acTimer = setTimeout(async () => {
			try {
				acItems = await searchCatalog(query.trim());
				acSelectedIndex = 0;
				acOpen = acItems.length > 0;
			} catch {
				acOpen = false;
			}
		}, 250);
	}

	function onKeyDown(e: KeyboardEvent) {
		if (!acOpen || filteredAcItems.length === 0) {
			if (e.key === 'Backspace' && query === '' && selectedDrugs.length > 0) {
				onremove(selectedDrugs[selectedDrugs.length - 1].largo_code);
			}
			return;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			acSelectedIndex = Math.min(acSelectedIndex + 1, filteredAcItems.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			acSelectedIndex = Math.max(acSelectedIndex - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const item = filteredAcItems[acSelectedIndex];
			if (item) selectDrug(item);
		} else if (e.key === 'Escape') {
			acOpen = false;
		}
	}

	function selectDrug(item: CatalogItem) {
		onadd({ largo_code: String(item.largo_code), name: item.name });
		query = '';
		acOpen = false;
		drugInput?.focus();
	}

	function handleClickOutside(e: MouseEvent) {
		if (drugBox && !drugBox.contains(e.target as Node)) {
			acOpen = false;
		}
	}
</script>

<svelte:document onclick={handleClickOutside} />

<div class="drug-search" bind:this={drugBox}>
	<div class="drug-tags">
		{#each selectedDrugs as drug (drug.largo_code)}
			<span class="drug-tag">
				{drug.name}
				<button onclick={() => onremove(drug.largo_code)} title="הסר" type="button">&times;</button>
			</span>
		{/each}
	</div>
	<div class="drug-input-wrapper">
		<input
			type="text"
			bind:this={drugInput}
			bind:value={query}
			oninput={onInput}
			onkeydown={onKeyDown}
			placeholder={selectedDrugs.length ? 'הוסף עוד...' : 'הקלד שם תרופה...'}
			autocomplete="off"
			inputmode="search"
			enterkeyhint="search"
			role="combobox"
			aria-expanded={acOpen}
			aria-autocomplete="list"
			aria-controls={acListId}
			aria-activedescendant={acOpen && filteredAcItems.length > 0 ? `drug-ac-${acSelectedIndex}` : undefined}
			aria-label="חיפוש תרופה"
		/>
		{#if acOpen && filteredAcItems.length > 0}
			<div class="autocomplete-list glass-panel dropdown-enter" id={acListId} role="listbox">
				{#each filteredAcItems as item, i}
					<button
						type="button"
						id="drug-ac-{i}"
						class="ac-item {i === acSelectedIndex ? 'selected' : ''}"
						onclick={() => selectDrug(item)}
						role="option"
						aria-selected={i === acSelectedIndex}
					>
					{item.name} <small>({item.largo_code})</small>
				</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.drug-search {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
		min-height: 44px;
		position: relative;
	}

	.drug-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.drug-tag {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		background: rgba(13, 115, 119, 0.12);
		color: var(--color-primary);
		border-radius: 20px;
		padding: 4px 12px;
		font-size: 0.82rem;
		font-weight: 600;
		white-space: nowrap;
		animation: tag-in 0.2s ease-out;
	}

	.drug-tag button {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-primary);
		font-size: 1.05rem;
		line-height: 1;
		min-width: 28px;
		min-height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		margin: -4px -6px -4px 0;
		opacity: 0.6;
		transition: opacity var(--transition-fast);
		border-radius: 50%;
	}

	.drug-tag button:hover {
		opacity: 1;
	}

	.drug-input-wrapper {
		position: relative;
		flex: 1;
		min-width: 140px;
	}

	.drug-input-wrapper input {
		width: 100%;
		border: none;
		outline: none;
		font-size: 0.9rem;
		padding: 4px 6px;
		background: transparent;
		font-family: var(--font-body);
		color: var(--color-text);
	}

	.autocomplete-list {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		left: 0;
		border-radius: var(--radius-md);
		max-height: 240px;
		overflow-y: auto;
		z-index: 9999;
	}

	.ac-item {
		display: block;
		width: 100%;
		text-align: inherit;
		background: none;
		border: none;
		font-family: var(--font-body);
		padding: 10px 14px;
		min-height: var(--min-touch);
		cursor: pointer;
		font-size: 0.88rem;
		transition: background var(--transition-fast);
		color: var(--color-text);
	}

	.ac-item:hover,
	.ac-item.selected {
		background: rgba(13, 115, 119, 0.08);
	}

	.ac-item small {
		color: var(--color-text-muted);
		font-size: 0.76rem;
	}

	@keyframes tag-in {
		from {
			opacity: 0;
			transform: scale(0.85);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

</style>
