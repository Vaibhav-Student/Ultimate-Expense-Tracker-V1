export function Footer({ onNav }) {
  const go = (id) => (e) => { e.preventDefault(); onNav?.(id); };
  const cols = [
    { h: "Desks", links: [["Overview", "overview"], ["Transactions", "transactions"], ["Budgets", "budgets"]] },
    { h: "Record", links: [["Categories", "categories"], ["Reports", "reports"], ["Settings", "settings"]] },
  ];

  return (
    <footer className="border-t-4 border-ink bg-paper no-print">
      <div className="px-4 py-10 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-editorial font-bold">Personal Finance Edition</p>
          <p className="font-serif font-black text-4xl tracking-tighter mt-1">THE LEDGER</p>
          <p className="font-body text-sm text-neutral-600 leading-relaxed mt-3 max-w-md text-justify">
            An independent record of personal finance. Every rupee accounted for, every number given its proper column.
            Figures derive from your ledger; sample rows are labeled SAMPLE.
          </p>
        </div>

        {cols.map(c => (
          <nav key={c.h} className="col-span-6 lg:col-span-2" aria-label={c.h}>
            <h3 className="font-mono text-xs uppercase tracking-widest border-b border-ink pb-2">{c.h}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, id]) => (
                <li key={id}>
                  <a href={`#/${id}`} onClick={go(id)} className="font-sans text-sm hover:text-editorial hover:underline decoration-2 decoration-editorial underline-offset-4 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="col-span-12 lg:col-span-2">
          <h3 className="font-mono text-xs uppercase tracking-widest border-b border-ink pb-2">Vol.</h3>
          <p className="font-serif font-black text-5xl mt-4">0.5</p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 mt-2">Ledger<br />Edition</p>
        </div>
      </div>

      <div className="border-t border-ink">
        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-1 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
          <span>© 2026 The Ledger Press Co. Local-first: data stays in your browser.</span>
          <span>Set in Playfair &amp; Lora &middot; Figures in tabular mono</span>
        </div>
      </div>
    </footer>
  );
}
