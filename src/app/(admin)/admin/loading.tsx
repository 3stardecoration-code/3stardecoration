export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between pb-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-100" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-24 rounded-lg bg-gray-200" />
          <div className="h-9 w-32 rounded-lg bg-gray-200" />
        </div>
      </div>

      {/* Filter / tabs bar skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-md bg-gray-200" />
          <div className="h-8 w-24 rounded-md bg-gray-100" />
          <div className="h-8 w-20 rounded-md bg-gray-100" />
        </div>
        <div className="h-9 w-64 rounded-lg bg-gray-100" />
      </div>

      {/* Table / Card skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
          <div className="h-4 w-1/4 rounded bg-gray-200" />
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-gray-100" />
                <div className="space-y-2">
                  <div className="h-4 w-44 rounded bg-gray-200" />
                  <div className="h-3 w-28 rounded bg-gray-100" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-5 w-16 rounded-full bg-gray-100" />
                <div className="h-4 w-20 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
