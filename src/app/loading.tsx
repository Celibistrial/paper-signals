import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-ink/20" />
      <p className="font-serif italic text-ink/40 animate-pulse">Consulting the archives...</p>
    </div>
  );
}
