import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 mb-3 text-[11px] font-mono uppercase tracking-[0.1em]"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  color: isLast ? 'var(--foreground)' : 'var(--text-muted)',
                }}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <span aria-hidden style={{ color: 'var(--text-muted)' }}>
                /
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
