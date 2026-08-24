export function WaitingRoom() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
      <h2 className="font-display text-2xl">Ashley komt zo bij je 💛</h2>
      <p className="max-w-sm text-sm text-muted">
        We hebben je aanvraag ontvangen. Zodra Ashley beschikbaar is, begint
        jullie gesprek — dit scherm ververst vanzelf, je hoeft niets te doen.
      </p>
    </div>
  );
}
