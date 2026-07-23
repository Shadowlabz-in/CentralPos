interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
    </header>
  );
}
