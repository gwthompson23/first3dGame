import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  // Allow overriding base via env (e.g. VITE_BASE="/repo/")
  const base = process.env.VITE_BASE ?? '/'
  return {
    base,
    build: {
      outDir: 'docs',
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  }
})
