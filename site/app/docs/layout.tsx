import type { Metadata } from 'next';
import { MarketProvider } from '../components/market/MarketProvider';
import { MarketPulse } from '../components/market/MarketPulse';
import { DocsSidebar } from '../components/docs/DocsSidebar';

export const metadata: Metadata = {
  title: 'Docs — Wick',
  description:
    'Living documentation for Wick — headless web components for trading interfaces. Every example is wired to one shared synthetic market feed.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider autoPlay initialScenario="calm">
      <div
        className="min-h-screen"
        style={{ background: 'var(--background)' }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            background:
              'radial-gradient(circle at 85% 0%, color-mix(in oklab, var(--green) 6%, transparent), transparent 40%)',
          }}
          aria-hidden
        />

        <div className="mx-auto max-w-[1280px] px-6 pt-24 pb-40">
          <div className="flex gap-12">
            <DocsSidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
      <MarketPulse />
    </MarketProvider>
  );
}
