import { Construction } from 'lucide-react';

export function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <Construction className="w-12 h-12 mb-4 opacity-30" />
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-sm mt-1">Esta aba será implementada em breve.</p>
    </div>
  );
}
