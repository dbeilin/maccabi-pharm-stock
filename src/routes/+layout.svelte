<script lang="ts">
	import 'leaflet/dist/leaflet.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>מלאי תרופות מכבי פארם</title>
	<meta name="description" content="חיפוש ומיפוי מלאי תרופות בבתי מרקחת מכבי פארם" />
	<link rel="icon" href="%sveltekit.assets%/favicon.svg" type="image/svg+xml" />
</svelte:head>

<a class="skip-link" href="#main-content">דלג לתוכן הראשי</a>
{@render children()}

<style>
	:root {
		--color-bg: #faf7f2;
		--color-surface: rgba(255, 252, 245, 0.85);
		--color-primary: #0d7377;
		--color-primary-dark: #095558;
		--color-accent: #c45b28;
		--color-text: #1a1a1a;
		--color-text-muted: #555555;
		--color-stock-in: #2d9f4c;
		--color-stock-few: #d4930d;
		--color-stock-few-text: #8a6500;
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
		--glass-bg-dropdown: rgba(255, 252, 245, 0.95);
		--glass-blur: blur(16px);
		--focus-ring: 0 0 0 3px rgba(13, 115, 119, 0.35);
		--transition-fast: 150ms ease;
		--transition-normal: 200ms ease;
		--min-touch: 44px;
		--gap-touch: 8px;
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

	:global(*:focus-visible) {
		outline: 3px solid var(--color-primary);
		outline-offset: 2px;
	}

	:global(button),
	:global(a),
	:global(input),
	:global(select),
	:global(label) {
		touch-action: manipulation;
	}

	:global(.leaflet-container) {
		font-family: var(--font-body) !important;
	}

	/* Shared glass panel */
	:global(.glass-panel) {
		background: var(--glass-bg-dropdown);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-elevated);
	}

	/* Shared dropdown entrance animation */
	:global(.dropdown-enter) {
		animation: dropdown-in var(--transition-fast) ease-out;
	}

	@keyframes -global-dropdown-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(*) {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}

	/* Skip link */
	.skip-link {
		position: absolute;
		top: -100%;
		right: 16px;
		z-index: 9999;
		background: var(--color-primary);
		color: white;
		padding: 8px 16px;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 0.9rem;
		text-decoration: none;
		transition: top var(--transition-fast);
	}

	.skip-link:focus {
		top: 8px;
	}
</style>
