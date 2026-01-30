import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        mkcert(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173,
        host: true,
        // proxy: {
        //     '/api': {
        //         target: 'https://vitrack.paybir.az',
        //         changeOrigin: true,
        //         secure: true,
        //         rewrite: (path) => path.replace(/^\/api/, ''),
        //     },
        // },
    },
})
