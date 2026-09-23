export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-64 bg-foreground/10 rounded"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card-bg border border-card-border rounded-xl p-6 shadow-xl h-32 flex flex-col justify-between">
            <div className="h-4 w-24 bg-foreground/10 rounded"></div>
            <div className="h-8 w-32 bg-foreground/10 rounded mt-4"></div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-card-bg border border-card-border rounded-xl p-6 shadow-xl h-[450px]">
        <div className="h-8 w-48 bg-foreground/10 rounded mb-6"></div>
        <div className="w-full h-[350px] bg-foreground/5 rounded-xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="bg-card-bg border border-card-border rounded-xl shadow-xl h-96">
          <div className="p-6 border-b border-card-border">
            <div className="h-6 w-40 bg-foreground/10 rounded"></div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-foreground/10 rounded"></div>
                  <div className="h-3 w-24 bg-foreground/10 rounded"></div>
                </div>
                <div className="h-5 w-16 bg-foreground/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl shadow-xl h-96">
          <div className="p-6 border-b border-card-border">
            <div className="h-6 w-32 bg-foreground/10 rounded"></div>
          </div>
          <div className="p-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-foreground/10 flex-shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 bg-foreground/10 rounded"></div>
                  <div className="h-3 w-32 bg-foreground/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
