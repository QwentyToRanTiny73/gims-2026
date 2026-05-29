import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — обязательно для GitHub Pages в подпапке репозитория.
export default defineConfig({
  base: './',
  plugins: [react()],
});
