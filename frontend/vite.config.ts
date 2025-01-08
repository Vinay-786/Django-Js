import { defineConfig } from 'vite'
import path from 'path'
import solid from 'vite-plugin-solid'

export default defineConfig({
	plugins: [solid()],
	base: './',
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				//rewrite: (path) => path.replace(/^\/api/, ''),
			}
		},
		watch: {
			usePolling: true,
		},
		open: true,
		hmr: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src/"),
			"@server": path.resolve(__dirname, "../server/"),
		},
	},
})
