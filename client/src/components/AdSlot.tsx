// AdSlot Component — AdSense-compliant placeholder
// Light theme: subtle gray slots with dashed border
// RULE: 20px minimum gap between ad units and clickable elements
// RULE: Maximum 3 ad units per page

interface AdSlotProps {
  format: 'banner' | 'rectangle' | 'large-rectangle' | 'leaderboard' | 'sidebar';
  className?: string;
}

const formatSizes: Record<string, { desktop: string; mobile: string; label: string }> = {
  banner: { desktop: '728×90', mobile: '320×50', label: 'Header Banner' },
  rectangle: { desktop: '300×250', mobile: '300×250', label: 'Rectangle' },
  'large-rectangle': { desktop: '336×280', mobile: '336×280', label: 'Large Rectangle' },
  leaderboard: { desktop: '728×90', mobile: '320×100', label: 'Leaderboard' },
  sidebar: { desktop: '160×600', mobile: '300×250', label: 'Sidebar' },
};

const formatClasses: Record<string, string> = {
  banner: 'h-[50px] sm:h-[90px]',
  rectangle: 'h-[250px]',
  'large-rectangle': 'h-[280px]',
  leaderboard: 'h-[100px] sm:h-[90px]',
  sidebar: 'h-[250px] lg:h-[600px]',
};

export default function AdSlot({ format, className = '' }: AdSlotProps) {
  const size = formatSizes[format];

  return (
    <div className={`my-5 ${className}`} style={{ minHeight: '20px' }}>
      <div
        className={`
          w-full ${formatClasses[format]}
          border border-dashed border-gray-200 rounded-xl
          bg-gray-50
          flex items-center justify-center
          transition-colors duration-300
        `}
      >
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest mb-1 text-gray-400">Advertisement</div>
          <div className="text-xs text-gray-300">{size.label} — {size.desktop}</div>
        </div>
      </div>
    </div>
  );
}
