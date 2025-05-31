import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    dts({
      exclude: ['**/*.stories.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: ['src/index.ts'],
      name: '@togana/material-symbols',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
    cssCodeSplit: true,
  },
});
