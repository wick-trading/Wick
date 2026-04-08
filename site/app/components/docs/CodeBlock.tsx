'use client';

import { useState } from 'react';

interface Tab {
  label: string;
  code: string;
}

interface Props {
  tabs: Tab[];
}

export function CodeBlock({ tabs }: Props) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tabs[active].code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div
        className="flex items-center justify-between border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActive(i)}
              className="px-4 py-2.5 text-[11px] font-mono uppercase tracking-wider transition-colors"
              style={{
                color:
                  i === active ? 'var(--foreground)' : 'var(--text-muted)',
                borderBottom:
                  i === active
                    ? '2px solid var(--green)'
                    : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors"
          style={{ color: copied ? 'var(--green)' : 'var(--text-muted)' }}
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
        >
          <span aria-hidden>{copied ? '✓ copied' : 'copy'}</span>
        </button>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Code copied to clipboard' : ''}
      </span>
      <pre
        className="px-4 py-4 text-[12px] font-mono overflow-x-auto leading-relaxed"
        style={{ color: 'var(--foreground)' }}
      >
        <code>{tabs[active].code}</code>
      </pre>
    </div>
  );
}
