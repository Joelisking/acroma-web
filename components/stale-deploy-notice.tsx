/**
 * What an `error.tsx` boundary shows for the moment between catching a
 * stale-deploy action error and the reload `useStaleDeployReload` triggers.
 * Deliberately calm: nothing is broken, the page is just about to refresh.
 */
export function StaleDeployNotice() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="text-brand-orange text-xs font-bold tracking-widest uppercase">
        One moment
      </p>
      <p className="text-muted-foreground mt-3 text-sm">
        Loading the latest version of Acroma.
      </p>
    </div>
  );
}
