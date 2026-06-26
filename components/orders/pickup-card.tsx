export function PickupCard() {
  return (
    <section
      className="card-warm p-5"
      aria-label="Pickup"
    >
      <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
        Fulfillment
      </p>
      <p className="text-foreground mt-2 text-sm leading-relaxed">
        Pickup. The customer will collect this order in person.
      </p>
    </section>
  );
}
