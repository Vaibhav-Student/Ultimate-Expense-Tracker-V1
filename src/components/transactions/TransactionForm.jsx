import { useEffect, useState } from "react";
import { useFinance } from "../../store/finance.jsx";
import { DEFAULT_ACCOUNTS } from "../../data/categories.js";
import { Field, inputCls } from "../ui/Field.jsx";
import { DateField } from "../ui/DateField.jsx";
import { SelectField } from "../ui/SelectField.jsx";
import { todayISO } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

// Reusable add/edit form. Uses integer-safe validation, preserves values on error,
// prevents double submit, announces results.
export function TransactionForm({ initial, onSaved, submitLabel }) {
  const { categories, settings, addTransaction, updateTransaction } = useFinance();
  const editing = Boolean(initial?.id);
  const [type, setType] = useState(initial?.type || "expense");
  const [amount, setAmount] = useState(initial ? String((initial.amountCents / 100).toFixed(2)) : "");
  const [description, setDescription] = useState(initial?.description || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [date, setDate] = useState(initial?.date || todayISO());
  const [account, setAccount] = useState(initial?.account || settings.defaultAccount || "Cash");
  const [merchant, setMerchant] = useState(initial?.merchant || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const catList = type === "income" ? categories.income : categories.expense;

  useEffect(() => {
    if (!category || !catList.includes(category)) {
      setCategory(catList[0] || (type === "income" ? "Salary" : "Other"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    const next = {};
    if (!description.trim()) next.description = "Description is required.";
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) next.amount = "Amount must be a number above zero.";
    if (!category) next.category = "Pick a category.";
    if (!date) next.date = "Pick a date.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setBusy(true);
    const payload = {
      type, amount: n, description: description.trim(), category, date,
      account, merchant: merchant.trim(), notes: notes.trim(),
    };
    const res = editing
      ? updateTransaction(initial.id, payload)
      : addTransaction(payload);
    setBusy(false);
    if (!res.ok) {
      setErrors({ form: res.error });
      return;
    }
    setStatus(editing ? "Corrections printed." : "Filed — above the fold.");
    if (!editing) {
      setDescription(""); setAmount(""); setMerchant(""); setNotes("");
    }
    onSaved?.(res.tx || res.budget);
  };

  return (
    <form onSubmit={submit} noValidate aria-label={editing ? "Edit transaction" : "Add transaction"}>
      <div className="grid grid-cols-2 border border-ink" role="tablist" aria-label="Transaction type">
        {[{ v: "expense", label: "Expense" }, { v: "income", label: "Income" }].map(o => (
          <button
            key={o.v}
            type="button"
            role="tab"
            aria-selected={type === o.v}
            onClick={() => setType(o.v)}
            className={cn(
              "py-2.5 font-sans text-xs font-bold uppercase tracking-widest transition-colors min-h-[44px]",
              type === o.v ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-neutral-100"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={`Amount (${settings.currency === "INR" ? "₹" : "$"})`} error={errors.amount} htmlFor="tx-amount">
          <input
            id="tx-amount" type="number" min="0.01" step="0.01" inputMode="decimal"
            value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00" className={inputCls} style={{ borderRadius: 0 }}
            aria-invalid={Boolean(errors.amount)}
          />
        </Field>
        <Field label="Date" error={errors.date} htmlFor="tx-date">
          <DateField id="tx-date" value={date} onChange={setDate} />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Description" error={errors.description} htmlFor="tx-desc">
          <input
            id="tx-desc" value={description} onChange={e => setDescription(e.target.value)}
            placeholder={type === "income" ? "Monthly salary — Acme Co." : "BigBasket groceries"}
            maxLength={120} className={inputCls} style={{ borderRadius: 0 }}
            aria-invalid={Boolean(errors.description)}
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Category" error={errors.category} htmlFor="tx-cat">
          <SelectField id="tx-cat" value={category} onChange={setCategory} options={catList} />
        </Field>
        <Field label="Account / Method" htmlFor="tx-acct">
          <SelectField
            id="tx-acct"
            value={account}
            onChange={setAccount}
            options={[...new Set([...DEFAULT_ACCOUNTS, account])]}
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Merchant (optional)" htmlFor="tx-merchant">
          <input
            id="tx-merchant" value={merchant} onChange={e => setMerchant(e.target.value)}
            placeholder="BigBasket" maxLength={80} className={inputCls} style={{ borderRadius: 0 }}
          />
        </Field>
        <Field label="Notes (optional)" htmlFor="tx-notes">
          <input
            id="tx-notes" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Monthly stock-up" maxLength={280} className={inputCls} style={{ borderRadius: 0 }}
          />
        </Field>
      </div>

      {errors.form && (
        <p role="alert" className="mt-4 border border-editorial px-3 py-2 font-mono text-xs uppercase tracking-widest text-editorial">
          {errors.form}
        </p>
      )}
      {status && !errors.form && (
        <p role="status" className="mt-4 border border-ink bg-ink text-paper px-3 py-2 font-mono text-xs uppercase tracking-widest">
          {status}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full mt-5 min-h-[44px] bg-ink text-paper border border-transparent hover:bg-paper hover:text-ink hover:border-ink font-sans text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-60"
      >
        {busy ? "Printing…" : (submitLabel || (editing ? "Save corrections" : `File ${type}`))}
      </button>
    </form>
  );
}
