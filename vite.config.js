import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves the project under /Ultimate-Expense-Tracker-V1/.
  // Local dev must stay at "/" so localhost keeps working.
  base: command === "build" ? "/Ultimate-Expense-Tracker-V1/" : "/",
  plugins: [react()],
}));
