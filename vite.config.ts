import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL || 'http://142.93.246.123:4001/api'),
      REACT_APP_ENV: JSON.stringify(process.env.REACT_APP_ENV || '')
    }
  }
})