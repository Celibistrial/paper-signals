import Link from 'next/link';
import { Tag, Building2 } from 'lucide-react';
import PaperCard from './PaperCard';

interface SectorIndustryListProps {
  sector?: string;
  industry?: string;
}

export default function SectorIndustryList({ sector, industry }: SectorIndustryListProps) {
  if (!sector && !industry) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {sector && (
        <Link href={`/sector/${encodeURIComponent(sector)}`} className="group flex-1 min-w-[140px]">
          <PaperCard className="p-3 bg-paper-dark/30 group-hover:bg-paper-dark transition-colors" hover={false}>
            <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-ink/40 uppercase tracking-widest">
              <Tag className="w-3 h-3" /> Sector
            </div>
            <div className="font-serif italic text-sm">{sector}</div>
          </PaperCard>
        </Link>
      )}
      {industry && (
        <Link href={`/industry/${encodeURIComponent(industry)}`} className="group flex-1 min-w-[140px]">
          <PaperCard className="p-3 bg-paper-dark/30 group-hover:bg-paper-dark transition-colors" hover={false}>
            <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-ink/40 uppercase tracking-widest">
              <Building2 className="w-3 h-3" /> Industry
            </div>
            <div className="font-serif italic text-sm">{industry}</div>
          </PaperCard>
        </Link>
      )}
    </div>
  );
}
