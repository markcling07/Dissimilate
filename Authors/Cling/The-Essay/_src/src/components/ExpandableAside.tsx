import { useState } from 'react';
import type { ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
}

/**
 * A collapsible side-note. It renders OPEN by default — both server-side and
 * before hydration — so the full text is always in the static HTML for
 * crawlers and no-JS readers. React only adds the ability to collapse it.
 */
export default function ExpandableAside({ label, children }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <aside className={`aside-note${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="aside-toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {label} <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <div className="aside-body" hidden={!open}>
        {children}
      </div>
    </aside>
  );
}
