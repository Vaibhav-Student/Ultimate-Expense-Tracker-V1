import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  OPENING_BALANCE_CENTS,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_BUDGETS,
} from "../data/categories.js";
import { toCents, monthKeyOf, currentMonthKey } from "../utils/format.js";

const K = {
  tx: "ledger-v3-transactions",
  budgets: "ledger-v3-budgets",
  cats: "ledger-v3-categories",
  settings: "ledger-v3-settings",
  sample: "ledger-v3-sample-flag",
};

function uid(prefix = "TX") {
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, "0")}`;
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage full / private mode */ }
}

// Realistic INR sample across 3 months, clearly labeled SAMPLE.
function sampleTransactions() {
  const T = (date, type, amount, description, category, account, merchant = "", notes = "") => ({
    id: uid("TX"),
    date,
    type,
    amountCents: Math.round(amount * 100),
    description,
    category,
    account,
    merchant,
    notes,
    status: "Cleared",
    sample: true,
    createdAt: new Date().toISOString(),
  });
  return [
    // October 2026 (reporting month)
    T("2026-10-09", "expense", 1840, "BigBasket groceries", "Food & Dining", "UPI", "BigBasket"),
    T("2026-10-08", "income", 85000, "Monthly salary — Acme Co.", "Salary", "HDFC ••4821", "Acme Co."),
    T("2026-10-07", "expense", 2180, "BESCOM electricity", "Utilities", "HDFC ••4821", "BESCOM"),
    T("2026-10-06", "expense", 840, "Metro + auto", "Transportation", "Cash", "Namma Metro"),
    T("2026-10-05", "expense", 620, "Filter coffee + lunch", "Food & Dining", "UPI", "MTR"),
    T("2026-10-04", "income", 14500, "Freelance layout work", "Freelance", "SBI ••1005", "Client — Studio K"),
    T("2026-10-03", "expense", 22000, "October rent", "Housing", "HDFC ••4821", "Landlord"),
    T("2026-10-02", "expense", 1499, "Netflix + Spotify + iCloud", "Subscriptions", "SBI ••1005", "Apple / Netflix"),
    T("2026-10-01", "expense", 3250, "D-Mart monthly stock-up", "Shopping", "UPI", "D-Mart"),
    // September 2026
    T("2026-09-28", "expense", 4999, "Bluetooth headphones", "Shopping", "SBI ••1005", "Croma"),
    T("2026-09-25", "income", 85000, "Monthly salary — Acme Co.", "Salary", "HDFC ••4821", "Acme Co."),
    T("2026-09-22", "expense", 1980, "Bescom + water", "Utilities", "HDFC ••4821", "BESCOM"),
    T("2026-09-20", "expense", 6400, "Weekend trip — Mysuru", "Travel", "SBI ••1005", "KSRTC + hotel"),
    T("2026-09-15", "expense", 22000, "September rent", "Housing", "HDFC ••4821", "Landlord"),
    T("2026-09-12", "expense", 9200, "Groceries + dining", "Food & Dining", "UPI", "Various"),
    T("2026-09-10", "income", 9000, "Freelance icons pack", "Freelance", "SBI ••1005", "Client — Studio K"),
    T("2026-09-05", "expense", 1250, "Pharmacy", "Healthcare", "Cash", "Apollo"),
    // August 2026
    T("2026-08-28", "income", 85000, "Monthly salary — Acme Co.", "Salary", "HDFC ••4821", "Acme Co."),
    T("2026-08-24", "expense", 22000, "August rent", "Housing", "HDFC ••4821", "Landlord"),
    T("2026-08-18", "expense", 11200, "Dining + Swiggy month", "Food & Dining", "UPI", "Swiggy"),
    T("2026-08-15", "expense", 7500, "Course + books", "Education", "SBI ••1005", "Coursera"),
    T("2026-08-11", "expense", 3200, "Movie + outings", "Entertainment", "Cash", "PVR"),
    T("2026-08-08", "income", 5200, "Dividends", "Investments", "SBI ••1005", "Zerodha"),
    T("2026-08-02", "expense", 4100, "Clothing", "Shopping", "SBI ••1005", "Decathlon"),
  ];
}

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    const existing = readJSON(K.tx, null);
    if (Array.isArray(existing) && existing.length > 0) return migrate(existing);
    const seed = sampleTransactions();
    writeJSON(K.sample, true);
    return seed;
  });
  const [budgets, setBudgets] = useState(() => {
    const existing = readJSON(K.budgets, null);
    if (Array.isArray(existing)) return existing;
    const mk = currentMonthKey();
    return DEFAULT_BUDGETS.map(b => ({
      id: uid("BG"),
      category: b.category,
      limitCents: b.limit * 100,
      month: mk,
    }));
  });
  const [cats, setCats] = useState(() => readJSON(K.cats, {
    expense: DEFAULT_EXPENSE_CATEGORIES,
    income: DEFAULT_INCOME_CATEGORIES,
  }));
  const [settings, setSettings] = useState(() => readJSON(K.settings, {
    currency: "INR",
    warningAt: 0.8,
    defaultAccount: "Cash",
  }));
  const [month, setMonth] = useState(() => currentMonthKey());

  useEffect(() => { writeJSON(K.tx, transactions); }, [transactions]);
  useEffect(() => { writeJSON(K.budgets, budgets); }, [budgets]);
  useEffect(() => { writeJSON(K.cats, cats); }, [cats]);
  useEffect(() => { writeJSON(K.settings, settings); }, [settings]);

  const api = useMemo(() => {
    const inMonth = (t, mk) => monthKeyOf(t.date) === mk;

    const monthTx = (mk) => transactions.filter(t => inMonth(t, mk)).sort((a, b) => (a.date < b.date ? 1 : -1));
    const sums = (list) => {
      let income = 0, expenses = 0;
      for (const t of list) {
        if (t.type === "income") income += t.amountCents;
        else expenses += t.amountCents;
      }
      return { income, expenses, net: income - expenses, count: list.length };
    };

    const allTime = sums(transactions);
    const balance = OPENING_BALANCE_CENTS + allTime.net;

    const byCategory = (list) => {
      const m = {};
      for (const t of list) {
        if (t.type !== "expense") continue;
        m[t.category] = (m[t.category] || 0) + t.amountCents;
      }
      return Object.entries(m)
        .map(([label, amountCents]) => ({ label, amountCents }))
        .sort((a, b) => b.amountCents - a.amountCents);
    };

    return {
      transactions, budgets, categories: cats, settings, month, setMonth,
      isSample: readJSON(K.sample, false),

      monthTx, sums, byCategory, balance, allTime,

      addTransaction: ({ type, amount, description, category, date, account, merchant, notes, status }) => {
        const cents = toCents(amount);
        if (!description?.trim() || cents == null || cents <= 0) return { ok: false, error: "Enter a description and an amount above zero." };
        if (!category) return { ok: false, error: "Pick a category." };
        if (!date) return { ok: false, error: "Pick a date." };
        const tx = {
          id: uid("TX"),
          date,
          type: type === "income" ? "income" : "expense",
          amountCents: cents,
          description: description.trim().slice(0, 120),
          category,
          account: account || settings.defaultAccount || "Cash",
          merchant: (merchant || "").slice(0, 80),
          notes: (notes || "").slice(0, 280),
          status: status || "Cleared",
          sample: false,
          createdAt: new Date().toISOString(),
        };
        setTransactions(prev => [tx, ...prev]);
        return { ok: true, tx };
      },

      updateTransaction: (id, patch) => {
        if (patch.amount != null) {
          const cents = toCents(patch.amount);
          if (cents == null || cents <= 0) return { ok: false, error: "Amount must be above zero." };
          patch = { ...patch, amountCents: cents };
          delete patch.amount;
        }
        if (patch.description != null && !String(patch.description).trim()) {
          return { ok: false, error: "Description cannot be empty." };
        }
        let updated = null;
        setTransactions(prev => prev.map(t => {
          if (t.id !== id) return t;
          updated = { ...t, ...patch, sample: false };
          return updated;
        }));
        return { ok: true, tx: updated };
      },

      deleteTransaction: (id) => setTransactions(prev => prev.filter(t => t.id !== id)),

      upsertBudget: ({ category, limit, month: mk }) => {
        const cents = toCents(limit);
        if (!category) return { ok: false, error: "Pick a category." };
        if (cents == null || cents <= 0) return { ok: false, error: "Limit must be above zero." };
        const target = mk || month;
        let done = null;
        setBudgets(prev => {
          const ix = prev.findIndex(b => b.category === category && b.month === target);
          if (ix >= 0) {
            const next = [...prev];
            next[ix] = { ...next[ix], limitCents: cents };
            done = next[ix];
            return next;
          }
          done = { id: uid("BG"), category, limitCents: cents, month: target };
          return [...prev, done];
        });
        return { ok: true, budget: done };
      },

      deleteBudget: (id) => setBudgets(prev => prev.filter(b => b.id !== id)),

      addCategory: (kind, name) => {
        const clean = String(name || "").trim().slice(0, 32);
        if (!clean) return { ok: false, error: "Name cannot be empty." };
        if (cats[kind].some(c => c.toLowerCase() === clean.toLowerCase())) {
          return { ok: false, error: "That category already exists." };
        }
        setCats(prev => ({ ...prev, [kind]: [...prev[kind], clean] }));
        return { ok: true };
      },

      renameCategory: (kind, oldName, newName) => {
        const clean = String(newName || "").trim().slice(0, 32);
        if (!clean) return { ok: false, error: "Name cannot be empty." };
        setCats(prev => ({ ...prev, [kind]: prev[kind].map(c => (c === oldName ? clean : c)) }));
        setTransactions(prev => prev.map(t => {
          const tKind = t.type === "income" ? "income" : "expense";
          if (tKind === kind && t.category === oldName) return { ...t, category: clean };
          return t;
        }));
        setBudgets(prev => prev.map(b => (b.category === oldName ? { ...b, category: clean } : b)));
        return { ok: true };
      },

      deleteCategory: (kind, name) => {
        const fallback = kind === "income" ? "Other Income" : "Other";
        setCats(prev => ({ ...prev, [kind]: prev[kind].filter(c => c !== name) }));
        setTransactions(prev => prev.map(t => {
          const tKind = t.type === "income" ? "income" : "expense";
          if (tKind === kind && t.category === name) return { ...t, category: fallback };
          return t;
        }));
        setBudgets(prev => prev.filter(b => b.category !== name));
        return { ok: true, reassignedTo: fallback };
      },

      updateSettings: (patch) => setSettings(prev => ({ ...prev, ...patch })),

      resetSample: () => {
        const seed = sampleTransactions();
        setTransactions(seed);
        writeJSON(K.sample, true);
        const mk = currentMonthKey();
        setBudgets(DEFAULT_BUDGETS.map(b => ({ id: uid("BG"), category: b.category, limitCents: b.limit * 100, month: mk })));
        setCats({ expense: DEFAULT_EXPENSE_CATEGORIES, income: DEFAULT_INCOME_CATEGORIES });
        setMonth(mk);
      },

      clearAll: () => {
        setTransactions([]);
        setBudgets([]);
        try { localStorage.removeItem(K.sample); } catch { /* noop */ }
      },
    };
  }, [transactions, budgets, cats, settings, month]);

  return <FinanceContext.Provider value={api}>{children}</FinanceContext.Provider>;
}

function migrate(list) {
  // Accept legacy float-amount records ({amount, payee}) and normalize to cents model.
  return list.map(t => {
    if (typeof t.amountCents === "number") {
      return {
        status: "Cleared", merchant: "", notes: "", sample: false,
        createdAt: new Date().toISOString(),
        account: t.account || "Cash",
        description: t.description || t.payee || "Entry",
        type: t.type || (t.amount < 0 ? "expense" : "income"),
        ...t,
      };
    }
    const signed = Number(t.amount ?? 0);
    const type = t.type || (signed < 0 ? "expense" : "income");
    return {
      id: t.id || uid("TX"),
      date: /^\d{4}-\d{2}-\d{2}/.test(t.date || "") ? t.date : "2026-10-01",
      type,
      amountCents: Math.round(Math.abs(signed) * 100),
      description: t.description || t.payee || "Entry",
      category: t.category || (type === "income" ? "Salary" : "Other"),
      account: t.account || "Cash",
      merchant: "",
      notes: "",
      status: t.status || "Cleared",
      sample: false,
      createdAt: new Date().toISOString(),
    };
  });
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside <FinanceProvider>");
  return ctx;
}
