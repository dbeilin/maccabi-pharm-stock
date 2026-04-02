<script lang="ts">
	let { visible = false }: { visible: boolean } = $props();
</script>

{#if visible}
	<div class="legend">
		<span class="legend-title">מקרא:</span>
		<div class="leg-item">
			<span class="leg-dot" style="background: var(--color-stock-in)"></span> במלאי
		</div>
		<div class="leg-item">
			<span class="leg-dot" style="background: var(--color-stock-few)"></span> מלאי חלקי
		</div>
		<div class="leg-item">
			<span class="leg-dot" style="background: var(--color-stock-out)"></span> אין במלאי
		</div>
		<div class="leg-item">
			<span class="leg-dot" style="background: var(--color-stock-unknown)"></span> לא ידוע
		</div>
	</div>
{/if}

<style>
	.legend {
		display: flex;
		gap: 16px;
		font-size: 0.78rem;
		color: var(--color-text-muted);
		align-items: center;
		padding: 6px 16px;
		flex-wrap: wrap;
	}

	.legend-title {
		font-weight: 600;
		color: var(--color-text);
	}

	.leg-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.leg-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid rgba(0, 0, 0, 0.1);
		flex-shrink: 0;
	}
</style>
