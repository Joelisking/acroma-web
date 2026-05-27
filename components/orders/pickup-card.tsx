export function PickupCard() {
  return (
    <section
      className="border-border/70 bg-card rounded-2xl border p-5"
      aria-label="Pickup"
    >
      <p className="eyebrow text-muted-foreground">Fulfillment</p>
      <p className="text-foreground mt-2 text-sm leading-relaxed">
        Pickup. The customer will collect this order in person.
      </p>
    </section>
  );
}
