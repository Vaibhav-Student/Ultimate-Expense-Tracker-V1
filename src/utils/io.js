// Import parsers for moving the ledger to a new device.
// Accepts our JSON backup ({transactions,…} or bare array) and our CSV export.
// Every row is validated; bad rows are reported, never silently dropped.

function splitCSVLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else quoted = false;
      } else cur += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function validDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function normType(s) {
  const v = String(s || "").trim().toLowerCase();
  if (["income", "in", "credit"].includes(v)) return "income";
  if (["expense", "out", "debit"].includes(v)) return "expense";
  if (["transfer", "move", "shift"].includes(v)) return "transfer";
  return null;
}

// Shared row validator → normalized skeleton or an error string.
function normalizeRow(r, lineNo) {
  const where = lineNo != null ? `Row ${lineNo}: ` : "";
  const type = normType(r.type);
  if (!type) return { error: `${where}unknown type "${r.type}".` };
  const cents = Math.round(Number(r.amount) * 100);
  if (!Number.isFinite(cents) || cents <= 0) return { error: `${where}amount must be above zero.` };
  if (!validDate(r.date)) return { error: `${where}date must be YYYY-MM-DD.` };
  if (type === "transfer") {
    const from = String(r.from_account || r.fromAccount || "").trim().slice(0, 24);
    const to = String(r.to_account || r.toAccount || "").trim().slice(0, 24);
    if (!from || !to) return { error: `${where}transfer needs from and to accounts.` };
    return {
      row: {
        date: r.date,
        type,
        amountCents: cents,
        description: String(r.description || "").trim().slice(0, 120) || `${from} → ${to}`,
        category: "Transfer",
        account: from,
        fromAccount: from,
        toAccount: to,
        merchant: "",
        status: "Cleared",
      },
    };
  }
  if (!String(r.description || "").trim()) return { error: `${where}description is required.` };
  return {
    row: {
      date: r.date,
      type,
      amountCents: cents,
      description: String(r.description).trim().slice(0, 120),
      category: String(r.category || "").trim().slice(0, 32) || (type === "income" ? "Other Income" : "Other"),
      account: String(r.account || "").trim().slice(0, 24) || "Cash",
      merchant: String(r.merchant || "").trim().slice(0, 80),
      status: "Cleared",
    },
  };
}

export function parseCSV(text) {
  const lines = String(text || "").split(/\r?\n/).filter(l => l.trim() !== "");
  if (lines.length < 2) return { kind: "csv", rows: [], errors: ["CSV has no data rows."] };
  const head = splitCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const need = ["date", "type", "description", "amount"];
  const missing = need.filter(n => !head.includes(n));
  if (missing.length > 0) {
    return { kind: "csv", rows: [], errors: [`Missing columns: ${missing.join(", ")}.`] };
  }
  const rows = [];
  const errors = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i]);
    const r = {};
    head.forEach((h, j) => { r[h] = cells[j] ?? ""; });
    const res = normalizeRow(r, i + 1);
    if (res.error) {
      if (errors.length < 8) errors.push(res.error);
    } else rows.push(res.row);
  }
  if (errors.length > 0) errors.push(`${rows.length} valid rows kept.`);
  return { kind: "csv", rows, errors };
}

export function parseJSONBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { kind: "json", rows: [], errors: ["File is not valid JSON."] };
  }
  const list = Array.isArray(data) ? data : data.transactions;
  if (!Array.isArray(list)) {
    return { kind: "json", rows: [], errors: ["JSON must be our backup object or a transactions array."] };
  }
  const rows = [];
  const errors = [];
  list.forEach((t, i) => {
    const raw = typeof t.amountCents === "number"
      ? { ...t, amount: t.amountCents / 100 }
      : t;
    const res = normalizeRow(raw, i + 1);
    if (res.error) {
      if (errors.length < 8) errors.push(res.error);
    } else {
      rows.push({ ...res.row, id: typeof t.id === "string" ? t.id : undefined });
    }
  });
  const out = { kind: "json", rows, errors };
  if (!Array.isArray(data) && data) {
    if (Array.isArray(data.budgets)) out.budgets = data.budgets;
    if (data.categories) out.categories = data.categories;
    if (data.settings) out.settings = data.settings;
  }
  return out;
}

export function parseLedgerFile(text, filename = "") {
  if (/\.csv$/i.test(filename)) return parseCSV(text);
  if (/\.json$/i.test(filename)) return parseJSONBackup(text);
  // No (usable) extension — sniff content.
  const t = String(text || "").trim();
  if (t.startsWith("{") || t.startsWith("[")) return parseJSONBackup(text);
  return parseCSV(text);
}
