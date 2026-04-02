import adapter from '@sveltejs/adapter-static';

const dev = process.argv.includes('dev');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
		 strict: false
		}),
		paths: {
			base: dev ? '' : '/maccabi-pharm-stock'
		},
		prerender: {
			entries: ['/']
		}
	}
};

export default config;
