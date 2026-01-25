import Link from 'next/link';
import { Tag } from 'lucide-react';
import PaperCard from './PaperCard';

const SECTORS = [
  'Financial Services',
  'Technology',
  'Energy',
  'Consumer Defensive'
];

export default function SectorArchive() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b-2 border-ink/10 pb-2">
        <Tag className="w-5 h-5 text-ink/60" />
        <h2 className="font-serif text-2xl italic">Archives by Classification</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SECTORS.map((sector, i) => (
          <Link href={`/sector/${encodeURIComponent(sector)}`} key={sector}>
            <PaperCard 
              delay={0.1 * i} 
              className="p-4 text-center bg-paper-dark/20 hover:bg-paper-dark/40 transition-colors h-full flex items-center justify-center border-dashed"
            >
              <span className="font-serif text-sm font-bold italic text-ink/70">{sector}</span>
            </PaperCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
