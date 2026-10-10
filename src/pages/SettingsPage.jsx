import { useState } from "react";
import { useFinance } from "../store/finance.jsx";
import { Field, inputCls } from "../components/ui/Field.jsx";
import { Confirm } from "../components/ui/Dialog.jsx";
import { DEFAULT_ACCOUNTS } from "../data/categories.js";
import { downloadFile } from "../utils/format.js";
import { cn } from "../utils/cn.js";

export function SettingsPage() {
  const f = useFinance();
  const [confirmClear, setConfirmClear] = useState(false);
  const [status, setStatus] = useState("");

  const exportJSON = () => {
    downloadFile(
      "ledger-backup.json",
      JSON.stringify({ transactions: f.transactions, budgets: f.budgets, categories: f.categories, settings: f.settings }, null, 2),
      "application/json"
    );
    setStatus("Backup downloaded as JSON.");
  };

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-editorial font-bold">Desk F · Press room</p>
      <h1 className="font-serif font-black tracking-tighter text-5xl sm:text-6xl leading-none mt-1">Settings.</h1>
      <p className="font-body text-[15px] text-neutral-600 mt-2 max-w-2xl">
        Currency, thresholds, and data controls. Data is local-first — nothing leaves your browser unless you export it.
      </p>

      {status && <p role="status" className="mt-4 border border-ink bg-ink text-paper px-3 py-2 font-mono text-xs uppercase tracking-widest">{status}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <section aria-labelledby="cur-h" className="border border-ink bg-paper p-5">
          <h2 id="cur-h" className="font-serif font-black text-2xl">Currency &amp; format.</h2>
          <div className="grid grid-cols-2 border border-ink mt-4" role="radiogroup" aria-label="Currency">
            {[{ v: "INR", label: "₹ INR · Indian" }, { v: "USD", label: "$ USD" }].map(o => (
              <button
                key={o.v}
                role="radio"
                aria-checked={f.settings.currency === o.v}
                onClick={() => { f.updateSettings({ currency: o.v }); setStatus(`Currency set to ${o.v}.`); }}
                className={cn(
                  "py-3 min-h-[44px] font-sans text-xs font-bold uppercase tracking-widest transition-colors",
                  f.settings.currency === o.v ? "bg-ink text-paper" : "hover:bg-neutral-100"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="font-body text-[13px] text-neutral-600 mt-3">
            INR uses Indian grouping — e.g. ₹1,25,000.00. All saved amounts stay in minor units; only presentation changes.
          </p>
          <div className="mt-4">
            <Field label="Default account for new entries" htmlFor="set-acct">
              <select
                id="set-acct"
                value={f.settings.defaultAccount}
                onChange={e => { f.updateSettings({ defaultAccount: e.target.value }); setStatus("Default account updated."); }}
                className={cn(inputCls, "cursor-pointer bg-paper")} style={{ borderRadius: 0 }}
              >
                {[...new Set([...DEFAULT_ACCOUNTS, ...f.transactions.map(t => t.account)])].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          </div>
        </section>

        <section aria-labelledby="warn-h" className="border border-ink bg-paper p-5">
          <h2 id="warn-h" className="font-serif font-black text-2xl">Budget warnings.</h2>
          <p className="font-body text-[13px] text-neutral-600 mt-1">Flag a desk as “Approaching Limit” once spending passes this share of its cap.</p>
          <div className="grid grid-cols-3 border border-ink mt-4" role="radiogroup" aria-label="Warning threshold">
            {[0.7, 0.8, 0.9].map(v => (
              <button
                key={v}
                role="radio"
                aria-checked={(f.settings.warningAt ?? 0.8) === v}
                onClick={() => { f.updateSettings({ warningAt: v }); setStatus(`Warning threshold set to ${Math.round(v * 100)}%.`); }}
                className={cn(
                  "py-3 min-h-[44px] font-mono text-sm font-bold transition-colors",
                  (f.settings.warningAt ?? 0.8) === v ? "bg-ink text-paper" : "hover:bg-neutral-100"
                )}
              >
                {Math.round(v * 100)}%
              </button>
            ))}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 mt-3">Exceeded = over 100%. Always labeled, never color-only.</p>
        </section>

        <section aria-labelledby="data-h" className="border border-ink bg-paper p-5 lg:col-span-2">
          <h2 id="data-h" className="font-serif font-black text-2xl">Data &amp; demonstration records.</h2>
          <p className="font-body text-[13px] text-neutral-600 mt-1">
            {f.transactions.length} transactions stored locally ({f.transactions.filter(t => t.sample).length} marked SAMPLE).
            Persistence is confirmed on every save to this browser.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button onClick={exportJSON} className="flex-1 min-h-[44px] border border-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
              Export backup (JSON)
            </button>
            <button onClick={() => { f.resetSample(); setStatus("Sample edition restored."); }} className="flex-1 min-h-[44px] border border-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
              Restore sample data
            </button>
            <button onClick={() => setConfirmClear(true)} className="flex-1 min-h-[44px] bg-editorial text-paper font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink transition-colors">
              Clear all data
            </button>
          </div>
        </section>
      </div>

      <Confirm
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Strike the entire record?"
        body="All transactions and budgets in this browser will be deleted. This cannot be undone — export a backup first if needed."
        confirmLabel="Clear everything"
        onConfirm={() => { f.clearAll(); setConfirmClear(false); setStatus("Ledger cleared. A blank page."); }}
      />
    </div>
  );
}
