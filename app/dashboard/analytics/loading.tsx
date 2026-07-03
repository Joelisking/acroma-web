export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="bg-muted h-8 w-40 animate-pulse rounded" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-muted h-[300px] animate-pulse rounded-xl" />
        <div className="bg-muted h-[300px] animate-pulse rounded-xl" />
      </div>
      <div className="bg-muted h-64 animate-pulse rounded-xl" />
    </div>
  );
}
