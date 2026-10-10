import { useState } from "react";
import { Header } from "./Header.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { Ticker } from "./Ticker.jsx";
import { Footer } from "./Footer.jsx";

const SIDEBAR_KEY = "ledger-v3-sidebar";

export function AppShell({ active, onNav, onAdd, onSearch, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "collapsed";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed(v => {
      const next = !v;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "collapsed" : "open");
      } catch { /* ignore */ }
      return next;
    });
  };

  const navAndClose = (id) => {
    setMenuOpen(false);
    onNav(id);
  };

  return (
    <div className="min-h-screen bg-paper text-ink sharp-corners">
      <Header
        onAdd={onAdd}
        onSearch={onSearch}
        onNav={navAndClose}
        onMenu={() => setMenuOpen(v => !v)}
        menuOpen={menuOpen}
      />
      <Ticker />
      <div className="flex items-stretch">
        <Sidebar
          active={active}
          onNav={navAndClose}
          mobileOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          collapsed={collapsed}
          onToggle={toggleCollapsed}
        />
        <main className="flex-1 min-w-0 px-4 py-6 lg:py-8 pb-10" id="main">
          {children}
        </main>
      </div>
      <Footer onNav={onNav} />
    </div>
  );
}
