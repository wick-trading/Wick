import type { Metadata } from 'next';
import { MarketProvider } from '../components/market/MarketProvider';
import { MarketPulse } from '../components/market/MarketPulse';

export const metadata: Metadata = {
  title: 'Live — Wick',
  description:
    'Living documentation. Every component below is wired to one synthetic market feed. Pick a scenario, scrub time, feel the tape.',
};

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketProvider autoPlay initialScenario="calm">
      {children}
      <MarketPulse />
    </MarketProvider>
  );
}
