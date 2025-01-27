import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { lingui } from '@lingui/vite-plugin'

// eslint-disable
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '@locales': path.resolve(__dirname, './locales'),
      '@assets': path.resolve(__dirname, 'src/assets/'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@helpers': path.resolve(__dirname, 'src/helpers'),
    },
    extensions: ['.js', '.ts', '.tsx', '.jsx'],
  },
  plugins: [
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
    }),
    lingui(),
  ],
})
