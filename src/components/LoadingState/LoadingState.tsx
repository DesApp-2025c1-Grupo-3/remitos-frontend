interface LoadingStateProps {
  title: string;
}

export default function LoadingState({ title }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-2" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      <p className="text-muted-foreground animate-pulse">Cargando {title}...</p>
    </div>
  );
}

