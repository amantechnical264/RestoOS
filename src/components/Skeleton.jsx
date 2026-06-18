// ─── Reusable Skeleton Loader Components ─────────────────────────────────────
// All skeletons use the .sk class for the shimmer animation (defined in index.css)
// Dark mode: neutral-800, Light mode: neutral-200

const Sk = ({ className = '' }) => (
  <div className={`sk rounded-lg bg-neutral-200 dark:bg-neutral-800 ${className}`} />
);

// ── Dish Card Skeleton (MenuPage grid) ────────────────────────────────────────
export const DishCardSkeleton = () => (
  <div className="rounded-[1.75rem] overflow-hidden bg-neutral-100 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/5">
    <Sk className="aspect-[4/3] rounded-none" />
    <div className="p-3 space-y-2">
      <Sk className="h-4 w-3/4" />
      <Sk className="h-3 w-1/2" />
      <Sk className="h-8 w-full rounded-xl mt-2" />
    </div>
  </div>
);

// ── Menu Hero + Category Pills Skeleton ───────────────────────────────────────
export const MenuPageSkeleton = () => (
  <div className="fixed inset-0 bg-neutral-50 dark:bg-black flex flex-col z-50 overflow-hidden">
    {/* Hero */}
    <Sk className="h-52 rounded-none" />
    {/* Category pills */}
    <div className="flex gap-2 px-5 py-4 overflow-hidden">
      {[80, 64, 72, 56, 68].map((w, i) => (
        <Sk key={i} className="h-9 rounded-2xl shrink-0" style={{ width: w }} />
      ))}
    </div>
    {/* Dish cards grid */}
    <div className="grid grid-cols-2 gap-3 px-5 pb-24">
      {Array.from({ length: 6 }).map((_, i) => (
        <DishCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ── Order Card Skeleton (DinerOrdersPage) ─────────────────────────────────────
export const OrderCardSkeleton = () => (
  <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden mb-4">
    <div className="p-4 flex items-start gap-4">
      <Sk className="w-12 h-12 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Sk className="h-4 w-3/5" />
        <Sk className="h-3 w-2/5" />
        <Sk className="h-3 w-1/3" />
      </div>
      <Sk className="w-16 h-6 rounded-full shrink-0" />
    </div>
    <div className="px-4 pb-4">
      <Sk className="h-12 w-full rounded-xl" />
    </div>
  </div>
);

// ── KPI Card Skeleton (Vendor Dashboard) ──────────────────────────────────────
export const KpiCardSkeleton = () => (
  <div className="rounded-3xl p-5 bg-white dark:bg-[#0a0a0a] border border-neutral-100 dark:border-white/6 space-y-3">
    <Sk className="w-10 h-10 rounded-2xl" />
    <div className="space-y-2">
      <Sk className="h-7 w-2/3" />
      <Sk className="h-3 w-1/2" />
    </div>
  </div>
);

// ── Order Lane Card Skeleton (Vendor Dashboard orders tab) ────────────────────
export const OrderLaneSkeleton = () => (
  <div className="rounded-2xl bg-white dark:bg-[#0a0a0a] border border-neutral-100 dark:border-white/6 p-4 space-y-3">
    <div className="flex justify-between">
      <Sk className="h-4 w-1/3" />
      <Sk className="h-4 w-1/4" />
    </div>
    <Sk className="h-3 w-1/2" />
    <div className="flex gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Sk key={i} className="h-6 w-16 rounded-full" />
      ))}
    </div>
    <Sk className="h-9 w-full rounded-xl" />
  </div>
);

// ── Customer Insights Skeleton (Vendor Dashboard customers tab) ───────────────
export const CustomerRowSkeleton = () => (
  <div className="px-5 py-4 flex items-center gap-4 border-b border-neutral-50 dark:border-white/4 last:border-0">
    <div className="flex-1 space-y-1.5">
      <Sk className="h-4 w-2/5" />
      <Sk className="h-3 w-3/5" />
    </div>
    <div className="text-right space-y-1 shrink-0">
      <Sk className="h-4 w-16" />
      <Sk className="h-3 w-12" />
    </div>
  </div>
);

export default Sk;
