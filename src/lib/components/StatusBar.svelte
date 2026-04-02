<script lang="ts">
	import type { StatusMessage } from '$lib/types/pharmacy';

	let { status = { message: '', type: '' as const } }: { status: StatusMessage } = $props();
</script>

{#if status.message}
	<div class="status-bar" class:loading={status.type === 'loading'} class:ok={status.type === 'ok'} class:err={status.type === 'err'}>
		{#if status.type === 'loading'}
			<span class="spinner"></span>
		{/if}
		<span>{status.message}</span>
	</div>
{/if}

<style>
	.status-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		font-size: 0.82rem;
		color: var(--color-text-muted);
		transition: color 0.2s;
	}

	.status-bar.ok {
		color: var(--color-stock-in);
	}

	.status-bar.err {
		color: var(--color-stock-out);
	}

	.status-bar.loading {
		color: var(--color-primary);
	}

	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid rgba(13, 115, 119, 0.2);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
