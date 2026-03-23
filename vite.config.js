import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@features': path.resolve(__dirname, './src/features'),
            '@components': path.resolve(__dirname, './src/components'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@store': path.resolve(__dirname, './src/store'),
        },
    },
    build: {
        // Performance: Chunk splitting for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks - cached separately
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
                    'vendor-bootstrap': ['react-bootstrap'],
                    'vendor-motion': ['framer-motion'],
                },
            },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 600,
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Minification with esbuild (built-in, fastest)
        minify: 'esbuild',
        // Generate source maps for debugging (optional)
        sourcemap: false,
    },
});
