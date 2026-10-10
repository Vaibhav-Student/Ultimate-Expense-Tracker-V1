import { useState } from "react";
import { useFinance } from "../store/finance.jsx";
import { Field } from "../components/ui/Field.jsx";
import { SelectField } from "../components/ui/SelectField.jsx";
import { Dialog, Confirm } from "../components/ui/Dialog.jsx";
import { DEFAULT_ACCOUNTS } from "../data/categories.js";
import { downloadFile } from "../utils/format.js";
import { parseLedgerFile } from "../utils/io.js";
import { cn } from "../utils/cn.js";

export function SettingsPage() {
  const f = useFinance();
  const [confirmClear, setConfirmClear] = useState(false);
  const [status, setStatus] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importParsed, setImportParsed] = useState(null);
  const [importMode, setImportMode] = useState("merge");
  const [importError, setImportError] = useState("");

  const exportJSON = () => {
    downloadFile(
      "ledger-backup.json",
      JSON.stringify({ transactions: f.transactions, budgets: f.budgets, categories: f.categories, settings: f.settings }, null, 2),
      "application/json"
    );
    setStatus("Backup downloaded as JSON.");
  };

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportError("");
    try {
      const text = await file.text();
      const parsed = parseLedgerFile(text, file.name);
      if (parsed.rows.length === 0) {
        setImportError(parsed.errors[0] || "No importable rows found.");
        return;
      }
      setImportFile(file);
      setImportParsed(parsed);
      setImportMode("merge");
    } catch {
      setImportError("Could not read that file.");
    }
  };

  const confirmImport = () => {
    const res = f.importLedger(importParsed, importMode);
    setImportOpen(false);
    setImportParsed(null);
    setImportFile(null);
    if (!res.ok) {
      setStatus("Import failed — file not applied.");
    } else if (res.skipped > 0) {
      setStatus(`Imported ${res.imported} rows, skipped ${res.skipped} already on file.`);
    } else {
      setStatus(`Imported ${res.imported} rows${importMode === "replace" ? " — ledger replaced." : "."}`);
    }
  };

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-editorial font-bold">Desk F · Press room</p>
      <h1 className="font-serif font-black tracking-tighter text-5xl sm:text-6xl leading-none mt-1">Settings.</h1>
      <p className="font-body text-[15px] text-neutral-600 mt-2 max-w-2xl">
        Currency, appearance, thresholds, and data controls. Data is local-first — nothing leaves your browser unless you export it.
      </p>

      {status && <p role="status" className="mt-4 border border-ink bg-ink text-paper px-3 py-2 font-mono text-xs uppercase tracking-widest">{status}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <section aria-labelledby="look-h" className="border border-ink bg-paper p-5">
          <h2 id="look-h" className="font-serif font-black text-2xl">Appearance.</h2>
          <div className="grid grid-cols-2 border border-ink mt-4" role="radiogroup" aria-label="Edition">
            {[{ v: "light", label: "Light edition" }, { v: "dark", label: "Night edition" }].map(o => (
              <button
                key={o.v}
                role="radio"
                aria-checked={(f.settings.theme || "light") === o.v}
                onClick={() => { f.updateSettings({ theme: o.v }); setStatus(`${o.label} set.`); }}
                className={cn(
                  "py-3 min-h-[44px] font-sans text-xs font-bold uppercase tracking-widest transition-colors",
                  (f.settings.theme || "light") === o.v ? "bg-ink text-paper" : "hover:bg-neutral-100"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="font-body text-[13px] text-neutral-600 mt-3">
            Day edition is warm paper and ink; night edition inverts the stock. Same borders, same type — choice is saved on this device.
          </p>
        </section>

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
              <SelectField
                id="set-acct"
                value={f.settings.defaultAccount}
                onChange={v => { f.updateSettings({ defaultAccount: v }); setStatus("Default account updated."); }}
                options={[...new Set([...DEFAULT_ACCOUNTS, ...f.transactions.map(t => t.account)])]}
              />
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
            {f.transactions.length} transactions stored on this device ({f.transactions.filter(t => t.sample).length} marked SAMPLE).
          </p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-pine mt-2" role="status">
            ● Saved in this browser
            {f.storage.savedAt ? ` · ${new Date(f.storage.savedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : ""}
            {` · ${(f.storage.bytes / 1024).toFixed(1)} KB`}
          </p>
          <p className="font-body text-[13px] text-neutral-600 mt-1">
            Per-device storage: your ledger lives in this browser's database (localStorage) — refresh-safe, offline, and never sent to any server.
            Moving devices? Export a backup, then import it here.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button onClick={exportJSON} className="min-h-[44px] border border-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
              Export backup (JSON)
            </button>
            <button onClick={() => { setImportOpen(true); setImportFile(null); setImportParsed(null); }} className="min-h-[44px] bg-ink text-paper font-sans text-xs font-bold uppercase tracking-widest hover:bg-paper hover:text-ink border hover:border-ink transition-colors">
              Import backup (CSV / JSON)
            </button>
            <button onClick={() => { f.resetSample(); setStatus("Sample edition restored."); }} className="min-h-[44px] border border-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
              Restore sample data
            </button>
            <button onClick={() => setConfirmClear(true)} className="min-h-[44px] bg-editorial text-on-accent font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
              Clear all data
            </button>
          </div>
        </section>
      </div>

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} title="Import a ledger file" kicker="New device desk">
        {!importParsed ? (
          <>
            <p className="font-body text-sm text-neutral-600">
              Drop in the JSON backup from Export, or a CSV with <span className="font-mono">date, type, description, amount</span> columns.
              Nothing is written until you confirm below.
            </p>
            <label
              htmlFor="import-file"
              className="mt-4 flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed border-ink px-4 py-5 text-center hover:bg-neutral-100 transition-colors"
            >
              <span className="font-sans text-xs font-bold uppercase tracking-widest">
                {importFile ? importFile.name : "Choose .json or .csv file"}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">CSV or JSON · stays in this browser</span>
            </label>
            <input
              id="import-file"
              type="file"
              accept=".json,.csv,application/json,text/csv"
              className="sr-only"
              onChange={onPickFile}
            />
            {importError && (
              <p role="alert" className="mt-3 border border-editorial px-3 py-2 font-mono text-xs uppercase tracking-widest text-editorial">
                {importError}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="border border-ink divide-y divide-ink font-mono text-sm tnum">
              <div className="flex justify-between px-4 py-2.5"><span className="text-neutral-500 text-xs uppercase tracking-widest">File</span><span className="truncate max-w-[60%]">{importFile?.name}</span></div>
              <div className="flex justify-between px-4 py-2.5"><span className="text-neutral-500 text-xs uppercase tracking-widest">Format</span><span>{importParsed.kind.toUpperCase()}</span></div>
              <div className="flex justify-between px-4 py-2.5"><span className="text-neutral-500 text-xs uppercase tracking-widest">Valid rows</span><span className="font-bold text-pine">{importParsed.rows.length}</span></div>
              {importParsed.errors.length > 0 && (
                <div className="px-4 py-2.5">
                  <p className="text-xs uppercase tracking-widest text-editorial">Skipped rows</p>
                  <ul className="mt-1 space-y-1 font-body text-[13px] text-neutral-600 normal-case">
                    {importParsed.errors.slice(0, 8).map((e, i) => <li key={i}>— {e}</li>)}
                  </ul>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 border border-ink mt-4" role="radiogroup" aria-label="Import mode">
              {[
                { v: "merge", label: "Add to ledger" },
                { v: "replace", label: "Replace ledger" },
              ].map(o => (
                <button
                  key={o.v}
                  type="button"
                  role="radio"
                  aria-checked={importMode === o.v}
                  onClick={() => setImportMode(o.v)}
                  className={cn(
                    "py-2.5 min-h-[44px] font-sans text-xs font-bold uppercase tracking-widest transition-colors",
                    importMode === o.v ? "bg-ink text-paper" : "hover:bg-neutral-100"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="font-body text-[13px] text-neutral-600 mt-2">
              {importMode === "merge"
                ? "New rows are appended; entries already on file are skipped."
                : "Warning: everything on this device is replaced by the file."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button onClick={() => { setImportParsed(null); setImportFile(null); }} className="flex-1 min-h-[44px] border border-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
                Pick another
              </button>
              <button onClick={confirmImport} disabled={importParsed.rows.length === 0} className="flex-1 min-h-[44px] bg-ink text-paper font-sans text-xs font-bold uppercase tracking-widest hover:bg-paper hover:text-ink border hover:border-ink transition-colors disabled:opacity-40">
                Import {importParsed.rows.length} rows
              </button>
            </div>
          </>
        )}
      </Dialog>

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
