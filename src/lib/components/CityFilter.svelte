<script lang="ts">
	let {
		selectedCities = [],
		availableCities = [],
		cityCounts = {},
		ontoggle,
		onclear,
		onselectall
	}: {
		selectedCities: string[];
		availableCities: string[];
		cityCounts?: Record<string, number>;
		ontoggle: (city: string) => void;
		onclear: () => void;
		onselectall: () => void;
	} = $props();

	let open = $state(false);
	let search = $state('');
	let container: HTMLDivElement;

	const filteredCities = $derived(
		search.trim()
			? availableCities.filter((c) => c.includes(search.trim()))
			: availableCities
	);

	const allSelected = $derived(
		availableCities.length > 0 && availableCities.every((c) => selectedCities.includes(c))
	);

	function handleClickOutside(e: MouseEvent) {
		if (container && !container.contains(e.target as Node)) {
			open = false;
		}
	}
</script>

<svelte:document onclick={handleClickOutside} />

<div class="city-filter" bind:this={container}>
	<button
		class="city-trigger"
		type="button"
		onclick={() => (open = !open)}
		aria-label="סנן לפי עיר"
		aria-expanded={open}
	>
		<span class="city-trigger-text">
			{selectedCities.length === 0
				? 'כל הערים'
				: selectedCities.length === 1
					? selectedCities[0]
					: `${selectedCities.length} ערים נבחרו`}
		</span>
		<svg
			class="chevron {open ? 'rotated' : ''}"
			viewBox="0 0 20 20"
			width="16"
			height="16"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
		</svg>
	</button>

	{#if selectedCities.length > 0}
		<button class="clear-badge" type="button" onclick={onclear} title="נקה ערים">
			&times;
		</button>
	{/if}

	{#if open}
		<div class="city-dropdown glass-panel dropdown-enter">
			<input
				type="text"
				class="city-search"
				placeholder="חפש עיר..."
				bind:value={search}
				autocomplete="off"
				inputmode="search"
			/>
			{#if availableCities.length > 0}
				<div class="select-all-row">
					<button
						type="button"
						class="select-all-btn"
						onclick={allSelected ? onclear : onselectall}
					>
						{allSelected ? 'בטל הכל' : 'בחר הכל'}
					</button>
					<span class="city-total-count">{availableCities.length} ערים</span>
				</div>
			{/if}
			<div class="city-list">
				{#each filteredCities as city (city)}
					{@const count = cityCounts[city]}
					<label class="city-option">
						<input
							type="checkbox"
							checked={selectedCities.includes(city)}
							onchange={() => ontoggle(city)}
						/>
						<span class="city-label">{city}</span>
						{#if count !== undefined}
							<span class="city-count">({count})</span>
						{/if}
					</label>
				{/each}
				{#if filteredCities.length === 0}
					<div class="city-empty">לא נמצאו ערים</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.city-filter {
		position: relative;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.city-trigger {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		min-height: var(--min-touch);
		background: transparent;
		border: none;
		cursor: pointer;
		font-family: var(--font-body);
		font-size: 0.88rem;
		color: var(--color-text);
		border-radius: var(--radius-sm);
		transition: background var(--transition-fast);
	}

	.city-trigger:hover {
		background: rgba(13, 115, 119, 0.08);
	}

	.city-trigger-text {
		white-space: nowrap;
	}

	.chevron {
		transition: transform 0.2s;
		flex-shrink: 0;
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	.clear-badge {
		background: rgba(196, 91, 40, 0.15);
		border: none;
		color: var(--color-accent);
		width: 32px;
		height: 32px;
		border-radius: 50%;
		font-size: 0.95rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background var(--transition-fast);
	}

	.clear-badge:hover {
		background: rgba(196, 91, 40, 0.25);
	}

	.city-dropdown {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		min-width: 240px;
		max-width: 320px;
		border-radius: var(--radius-md);
		z-index: 9998;
		overflow: hidden;
	}

	.city-search {
		width: 100%;
		padding: 10px 14px;
		border: none;
		border-bottom: 1px solid var(--color-border);
		font-family: var(--font-body);
		font-size: 0.86rem;
		outline: none;
		background: transparent;
		color: var(--color-text);
	}

	.select-all-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 14px;
		border-bottom: 1px solid var(--color-border);
	}

	.select-all-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-family: var(--font-body);
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-primary);
		padding: 2px 0;
		transition: opacity 0.15s;
	}

	.select-all-btn:hover {
		opacity: 0.75;
	}

	.city-total-count {
		font-size: 0.76rem;
		color: var(--color-text-muted);
	}

	.city-list {
		max-height: 220px;
		overflow-y: auto;
		padding: 4px 0;
	}

	.city-option {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 14px;
		min-height: var(--min-touch);
		cursor: pointer;
		font-size: 0.86rem;
		transition: background var(--transition-fast);
	}

	.city-option:hover {
		background: rgba(13, 115, 119, 0.06);
	}

	.city-option input[type='checkbox'] {
		accent-color: var(--color-primary);
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.city-label {
		flex: 1;
	}

	.city-count {
		font-size: 0.76rem;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.city-empty {
		padding: 16px;
		text-align: center;
		color: var(--color-text-muted);
		font-size: 0.84rem;
	}

</style>
