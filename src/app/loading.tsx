export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-4 max-w-md">
        <div className="h-10 bg-card-bg/80 border border-card-border rounded-xl w-3/4" />
        <div className="h-4 bg-card-bg/60 border border-card-border/60 rounded-md w-full" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-80 rounded-2xl bg-card-bg/40 border border-card-border/60 p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-40 rounded-xl bg-card-bg/60 border border-card-border/40" />
              <div className="h-6 bg-card-bg/80 rounded-md w-2/3" />
              <div className="h-4 bg-card-bg/50 rounded-md w-1/2" />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-card-border/40">
              <div className="h-6 w-20 bg-card-bg/70 rounded-md" />
              <div className="h-8 w-24 bg-primary/20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
