/**
 * Reusable skeleton building-blocks.
 * All skeletons use Tailwind `animate-pulse` on gray bg rectangles to match the
 * final layout shape, eliminating content-shift when data loads.
 */

/** A single stat card skeleton matching StatsCard dimensions */
export function StatCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-2.5 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}

/** A skeleton matching the HabitCard layout */
export function HabitCardSkeleton() {
  return (
    <div className="card animate-pulse">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>
        <div className="text-right space-y-1">
          <div className="h-8 w-10 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
          <div className="h-3 w-14 bg-gray-100 dark:bg-gray-800 rounded ml-auto" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>

      {/* Button placeholder */}
      <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  );
}

/** A skeleton matching the PoolDisplay card */
export function PoolSkeleton() {
  return (
    <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-32 bg-primary-200 rounded" />
          <div className="h-8 w-28 bg-primary-200 rounded" />
          <div className="h-2.5 w-36 bg-primary-100 rounded" />
        </div>
        <div className="w-16 h-16 bg-primary-200 rounded-full" />
      </div>
    </div>
  );
}

/** Grid of HabitCard skeletons */
export function HabitListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <HabitCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Grid of stat card skeletons for the Dashboard */
export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
