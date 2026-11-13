/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { SITE_BASE } from './src/shared/site.ts';

export default defineConfig({
  base: SITE_BASE,
  plugins: [svelte()],
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
