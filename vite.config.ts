import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

function inlineCss() {
  return {
    name: 'vite-plugin-inline-css',
    apply: 'build' as const,
    generateBundle(_options: any, bundle: any) {
      let cssText = '';
      for (const file of Object.values(bundle)) {
        if ((file as any).type === 'asset' && (file as any).fileName.endsWith('.css')) {
          cssText += (file as any).source;
        }
      }
      if (cssText) {
        const injectCode = `if(typeof document!=="undefined"){const style=document.createElement("style");style.textContent=${JSON.stringify(cssText)};document.head.appendChild(style);}\n`;
        for (const file of Object.values(bundle)) {
          if ((file as any).type === 'chunk' && (file as any).fileName.endsWith('.js')) {
            (file as any).code = injectCode + (file as any).code;
          }
        }
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), inlineCss()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SprintCheckSDK',
      formats: ['es', 'umd'],
      fileName: (format) => `sprintcheck-sdk.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.sprintcheck.megasprintlimited.com.ng',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})


