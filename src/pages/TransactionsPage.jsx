import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { useFinance } from "../store/finance.jsx";
import { TransactionTable } from "../components/transactions/TransactionTable.jsx";
import { TransactionFilters } from "../components/transactions/TransactionFilters.jsx";
import { formatCurrency, toCSV, downloadFile } from "../utils/format.js";

const PAGE_SIZE = 10;

export function TransactionsPage({ globalQuery, onAdd, onEdit, onDelete }) {
  const f = useFinance();
  const [filters, setFilters] = useState({ type: "all", category: "all", account: "all", from: "", to: "", page: 1 });
  const [sort, setSort] = useState({ key: "date", dir: "desc" });

  const allAccounts = useMemo(() => [...new Set(f.transactions.map(t => t.account))], [f.transactions]);

  const filtered = useMemo(() => {
    const q = (globalQuery || "").toLowerCase();
    let rows = f.transactions.filter(t => {
      if (filters.type !== "all" && t.type !== filters.type) return false;
      if (filters.category !== "all" && t.category !== filters.category) return false;
      if (filters.account !== "all" && t.account !== filters.account) return false;
      if (filters.from && t.date < filters.from) return false;
      if (filters.to && t.date > filters.to) return false;
      if (q && !`${t.description} ${t.merchant} ${t.category} ${t.account}`.toLowerCase().includes(q)) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const k = sort.key;
      let va, vb;
      if (k === "amount") { va = a.amountCents; vb = b.amountCents; }
      else if (k === "date") { va = a.date; vb = b.date; }
      else { va = String(a[k] ?? "").toLowerCase(); vb = String(b[k] ?? "").toLowerCase(); }
      const r = va < vb ? -1 : va > vb ? 1 : 0;
      return sort.dir === "asc" ? r : -r;
    });
    return rows;
  }, [f.transactions, filters, sort, globalQuery]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(filters.page || 1, pages);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totals = filtered.reduce((a, t) => {
    if (t.type === "income") a.in += t.amountCents;
    else if (t.type === "expense") a.out += t.amountCents;
    return a;
  }, { in: 0, out: 0 });

  const onSort = (key) => setSort(s => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "description" ? "asc" : "desc" }));

  const exportCSV = () => {
    const head = ["id", "date", "type", "description", "category", "account", "from_account", "to_account", "merchant", "amount", "currency", "sample"];
    const body = filtered.map(t => [
      t.id, t.date, t.type, t.description, t.category, t.account, t.fromAccount || "", t.toAccount || "", t.merchant,
      (t.amountCents / 100).toFixed(2), f.settings.currency, t.sample ? "yes" : "no",
    ]);
    downloadFile(`ledger-transactions-${Date.now()}.csv`, toCSV([head, ...body]));
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-editorial font-bold">Desk B · Full record</p>
          <h1 className="font-serif font-black tracking-tighter text-5xl sm:text-6xl leading-none mt-1">The Transaction Ledger.</h1>
          <p className="font-body text-[15px] text-neutral-600 mt-2 max-w-2xl">
            {filtered.length} of {f.transactions.length} entries · in {formatCurrency(totals.in, f.settings.currency)} · out {formatCurrency(totals.out, f.settings.currency)}.
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={exportCSV} className="min-h-[44px] px-4 inline-flex items-center gap-2 border border-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
            <Download className="h-4 w-4" strokeWidth={1.5} /> CSV
          </button>
          <button onClick={onAdd} className="min-h-[44px] px-4 inline-flex items-center gap-2 bg-ink text-paper font-sans text-xs font-bold uppercase tracking-widest hover:bg-paper hover:text-ink border hover:border-ink transition-colors">
            <Plus className="h-4 w-4" strokeWidth={2} /> Add
          </button>
        </div>
      </div>

      <div className="mt-5 no-print">
        <TransactionFilters value={{ ...filters, allAccounts }} onChange={setFilters} />
      </div>

      <div className="mt-4">
        <TransactionTable rows={rows} sort={sort} onSort={onSort} onEdit={onEdit} onDelete={onDelete} onAdd={onAdd} />
      </div>

      <div className="mt-3 flex items-center justify-between border border-ink bg-paper px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
          Page {page} of {pages} · {filtered.length} rows
        </span>
        <div className="flex gap-2 no-print">
          <button disabled={page <= 1} onClick={() => setFilters({ ...filters, page: page - 1 })} className="min-h-[44px] px-4 border border-ink font-sans text-xs font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-ink hover:text-paper transition-colors">Prev</button>
          <button disabled={page >= pages} onClick={() => setFilters({ ...filters, page: page + 1 })} className="min-h-[44px] px-4 border border-ink font-sans text-xs font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-ink hover:text-paper transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
