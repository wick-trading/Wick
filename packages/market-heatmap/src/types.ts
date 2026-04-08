export type HeatmapTile = {
  id: string;
  label: string;
  /** Size dimension (market cap, volume, etc.) — determines tile area */
  value: number;
  /** Color dimension — % change drives green/red intensity */
  change: number;
  /** Optional sub-label (e.g. "$67,432") */
  sublabel?: string;
};
