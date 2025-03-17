import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        // Main process entry file
        entry: 'electron/main.ts',
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              output: {
                entryFileNames: '[name].js',
                format: 'cjs', // 使用 CommonJS 格式
              },
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@styles': resolve(__dirname, 'src/styles'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "sass:math";
          @use "sass:color";
          @use "@/styles/variables" as *;
        `
      },
    },
  },
  build: {
    assetsInlineLimit: 0, // 禁用资源内联，确保 SVG 文件被正确处理
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // element-plus 相关依赖
          if (id.includes('node_modules/element-plus') || 
              id.includes('node_modules/@element-plus') ||
              id.includes('node_modules/@floating-ui')) {
            return 'element-plus'
          }
          // 核心依赖
          if (id.includes('node_modules/vue') || 
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/pinia') ||
              id.includes('node_modules/@vue') ||
              id.includes('node_modules/@vueuse')) {
            return 'vendor'
          }
          // 加密相关
          if (id.includes('node_modules/crypto-js') ||
              id.includes('node_modules/jsencrypt')) {
            return 'crypto'
          }
          // 格式化相关
          if (id.includes('node_modules/fast-xml-parser') ||
              id.includes('node_modules/diff')) {
            return 'format'
          }
        }
      }
    }
  },
})
