import { useCallback, useEffect, useState } from "react";
import { FinanceProvider, useFinance } from "./store/finance.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";
import { OverviewPage } from "./pages/OverviewPage.jsx";
import { TransactionsPage } from "./pages/TransactionsPage.jsx";
import { BudgetsPage } from "./pages/BudgetsPage.jsx";
import { CategoriesPage } from "./pages/CategoriesPage.jsx";
import { ReportsPage } from "./pages/ReportsPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import { Dialog, Confirm } from "./components/ui/Dialog.jsx";
import { TransactionForm } from "./components/transactions/TransactionForm.jsx";

const ROUTES = ["overview", "transactions", "budgets", "categories", "reports", "settings"];

function routeFromHash() {
  const m = window.location.hash.match(/^#\/(\w+)/);
  return ROUTES.includes(m?.[1]) ? m[1] : "overview";
}

function Shell() {
  const [route, setRoute] = useState(() => routeFromHash());
  const [query, setQuery] = useState("");
  const [txDialog, setTxDialog] = useState(null); // null | {mode:'add'} | {mode:'edit', tx}
  const [deleting, setDeleting] = useState(null);
  const { deleteTransaction } = useFinance();

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const nav = useCallback((id) => {
    setRoute(id);
    window.location.hash = `#/${id}`;
    document.getElementById("main")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const openAdd = useCallback(() => setTxDialog({ mode: "add" }), []);
  const openEdit = useCallback((tx) => setTxDialog({ mode: "edit", tx }), []);

  return (
    <AppShell active={route} onNav={nav} onAdd={openAdd} onSearch={(q) => { setQuery(q); if (q && route !== "transactions") nav("transactions"); }}>
      {route === "overview" && (
        <OverviewPage onAdd={openAdd} onEdit={openEdit} onDelete={setDeleting} onNav={nav} />
      )}
      {route === "transactions" && (
        <TransactionsPage globalQuery={query} onAdd={openAdd} onEdit={openEdit} onDelete={setDeleting} />
      )}
      {route === "budgets" && <BudgetsPage />}
      {route === "categories" && <CategoriesPage />}
      {route === "reports" && <ReportsPage />}
      {route === "settings" && <SettingsPage />}

      <Dialog
        open={Boolean(txDialog)}
        onClose={() => setTxDialog(null)}
        title={txDialog?.mode === "edit" ? "Correct the entry" : "File a transaction"}
        kicker={txDialog?.mode === "edit" ? "Corrections desk" : "New entry"}
      >
        {txDialog && (
          <TransactionForm
            key={txDialog.mode === "edit" ? txDialog.tx.id : "new"}
            initial={txDialog.mode === "edit" ? txDialog.tx : null}
            onSaved={() => setTxDialog(null)}
          />
        )}
      </Dialog>

      <Confirm
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Strike this entry?"
        body={`“${deleting?.description}” will be removed from the ledger. Balances, reports, and budgets recalculate immediately.`}
        confirmLabel="Delete entry"
        onConfirm={() => { deleteTransaction(deleting.id); setDeleting(null); }}
      />
    </AppShell>
  );
}

function App() {
  return (
    <FinanceProvider>
      <Shell />
    </FinanceProvider>
  );
}

export default App;
