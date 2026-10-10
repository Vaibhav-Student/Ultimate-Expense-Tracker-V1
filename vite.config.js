import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from a project subpath on GitHub Pages:
  // https://Vaibhav-Student.github.io/Ultimate-Expense-Tracker-V1/
  base: "/Ultimate-Expense-Tracker-V1/",
  plugins: [react()],
})
