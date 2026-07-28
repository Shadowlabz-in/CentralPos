import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-muted-foreground">
      <Construction size={48} className="text-muted-foreground/40" />
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm">Coming soon</p>
    </div>
  );
}
