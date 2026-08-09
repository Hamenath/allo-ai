export default function AppLoading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col gap-6 p-4 animate-pulse max-w-6xl mx-auto">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-md bg-muted"></div>
        <div className="h-4 w-96 rounded-md bg-muted/60"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="h-32 rounded-xl bg-muted/40 border border-border/50"></div>
        <div className="h-32 rounded-xl bg-muted/40 border border-border/50"></div>
        <div className="h-32 rounded-xl bg-muted/40 border border-border/50"></div>
      </div>

      <div className="h-64 rounded-xl bg-muted/30 border border-border/50"></div>
    </div>
  );
}
