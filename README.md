# The Ledger — Expense Tracker (Newsprint Finance)

React 19 + Vite + Tailwind CSS 3 + lucide-react. Local-first, no backend.

## Run

```bash
npm install
npm run dev
npm run build
```

## Pages (hash routes)

- `#/overview` — Dashboard: hero, 4-panel summary, donut/bars/6-month trend + table alternative, latest entries, budget watch, derived month-in-review
- `#/transactions` — Sortable ledger, search, type/category/account/date filters, pagination, add/edit dialog (one shared form), delete confirm, CSV export
- `#/budgets` — Monthly caps per category, rectangular progress, On Track / Approaching / Exceeded, create/edit/delete
- `#/categories` — 12 expense + 6 income desks, create/rename/delete with reassignment (never drops history)
- `#/reports` — Date-range record: totals, donut, bars, trend, budget-vs-actual, CSV + print-friendly
- `#/settings` — Currency (INR Indian grouping / USD), warning threshold, default account, JSON backup, sample restore, clear-all

## Architecture

```
src/
  components/
    ui/          # Button, Badge, Card/IconBox, SectionHeading, Dialog/Confirm, Field/Progress/EmptyState/StatusBadge
    layout/      # Header (brand, VOL line, search, alerts, +ADD), Sidebar (6 desks, bottom nav mobile), Ticker, Footer, AppShell
    transactions/# TransactionForm (add+edit), TransactionTable, TransactionFilters
    budgets/     # BudgetCard, BudgetForm, budgetStatus()
    reports/     # CategoryDonut, CategoryBars, CashflowTrend (CSS-only, tabular alternatives)
  pages/         # One file per route above
  store/
    finance.jsx  # FinanceProvider: transactions (cents), budgets, categories, settings, month; localStorage; useFinance()
  data/
    categories.js# Defaults + opening balance
  utils/
    format.js    # Cents math, INR/USD formatting, month keys, CSV/download, dates
  App.jsx        # Hash router + dialog host (add/edit/delete)
```

- Money stored as integer minor units (paise/cents); formatting via `Intl` (`en-IN` → ₹1,25,000.00).
- All summaries, deltas, budgets, insights derive from the transaction array — nothing hardcoded.
- Sample data (~24 INR rows across 3 months) labeled SAMPLE; clear in Settings.
- No router/chart deps: hash navigation + CSS charts keep the bundle light and accessible.

## Newsprint tokens

Paper `#F9F9F7`, ink `#111111`, editorial red `#CC0000`, pine green `#276749` (+ `pinebg`/`rosebg` washes).
Playfair Display / Lora / Inter / JetBrains Mono (tabular figures). 0px radius, 1/2/4px ink borders,
hard-shadow hover, dot-grid texture, fast 200ms mechanical motion, `prefers-reduced-motion` support.
Status never color-only: labels (IN/OUT, On Track/Exceeded), icons, and numbers accompany color.
