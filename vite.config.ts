import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves project sites from /<repository-name>/.
export default defineConfig({
  base:
    process.env.VITE_BASE_PATH ||
    (process.env.GITHUB_ACTIONS ? '/QuJin_ZeroCarbon_IOC/' : '/'),
  plugins: [react()],
});
