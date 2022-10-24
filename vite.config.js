import { defineConfig, loadEnv } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from "svelte-preprocess";

// https://vitejs.dev/config/
export default ({mode}) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd())};

	console.log('--mode',mode);
	console.log('--mode',mode);
	return defineConfig({
		build: {
			lib: {
				entry: "./src/lib.js",
				name: "ODA",
				fileName: "ocm-qr-field",
			},
			
			//rollupOptions: {
			//	input: ['./src/App.svelte'],
			//}
		},
		plugins: [
			
			/*svelte({
				compilerOptions: {
				customElement: true,
				},
			})*/
			svelte({
				include: ["src/App.svelte"],
				preprocess: sveltePreprocess({postcss: true}),
				compilerOptions: {
					//dev:!import.meta.env.PROD,
					css: true,
					customElement: (mode === 'production'),
				},
			}),
			svelte({
				include: ["src/**/*.svelte"],
				exclude: ["src/App.svelte"],
				preprocess: sveltePreprocess({postcss: true}),
				compilerOptions: {
					//dev:!import.meta.env.PROD,
					css: true,
					customElement: true,
				},
			}),
		]
	})
}