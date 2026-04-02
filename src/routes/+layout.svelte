<script lang="ts">
	import 'leaflet/dist/leaflet.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>מלאי תרופות מכבי פארם</title>
	<meta name="description" content="חיפוש ומיפוי מלאי תרופות בבתי מרקחת מכבי פארם" />
	<link rel="icon" href="%sveltekit.assets%/favicon.svg" type="image/svg+xml" />
</svelte:head>

{@render children()}

<style>
	:root {
		--color-bg: #faf7f2;
		--color-surface: rgba(255, 252, 245, 0.85);
		--color-primary: #0d7377;
		--color-primary-dark: #095558;
		--color-accent: #c45b28;
		--color-text: #1a1a1a;
		--color-text-muted: #6b6b6b;
		--color-stock-in: #2d9f4c;
		--color-stock-few: #d4930d;
		--color-stock-out: #c93b3b;
		--color-stock-unknown: #8e8e8e;
		--color-border: rgba(0, 0, 0, 0.08);
		--font-display: 'Heebo', sans-serif;
		--font-body: 'Heebo', sans-serif;
		--radius-sm: 8px;
		--radius-md: 14px;
		--radius-lg: 20px;
		--shadow-card: 0 2px 12px rgba(0, 0, 0, 0.08);
		--shadow-elevated: 0 8px 32px rgba(0, 0, 0, 0.12);
		--glass-bg: rgba(255, 252, 245, 0.82);
		--glass-blur: blur(16px);
	}

	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family: var(--font-body);
		background: var(--color-bg);
		direction: rtl;
		color: var(--color-text);
		overflow: hidden;
		height: 100vh;
		width: 100vw;
		margin: 0;
	}

	:global(.leaflet-container) {
		font-family: var(--font-body) !important;
	}
</style>
