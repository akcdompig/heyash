import { PricingTable } from "@/components/landing/PricingTable";

export function EndOfTimeCard({
  isFreeIntro,
  viewerRole,
}: {
  isFreeIntro: boolean;
  viewerRole: "USER" | "OPERATOR";
}) {
  if (viewerRole === "OPERATOR") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <h2 className="font-display text-2xl">Gesprekstijd is op</h2>
        <p className="text-sm text-muted">
          De gebruiker beslist nu of ze extra tijd kopen om verder te praten.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto px-6 py-12 text-center">
      {isFreeIntro ? (
        <>
          <h2 className="font-display text-2xl">De 2 minuten zijn voorbij 💛</h2>
          <p className="max-w-sm text-sm text-muted">Was het fijn om even te praten?</p>
        </>
      ) : (
        <>
          <h2 className="font-display text-2xl">Je gesprekstijd is op 💛</h2>
          <p className="max-w-sm text-sm text-muted">
            Wil je verder praten? Koop wat extra tijd en je gesprek gaat
            gewoon door, precies waar je gebleven was.
          </p>
        </>
      )}
      <div className="w-full max-w-3xl">
        <PricingTable purchasable />
      </div>
    </div>
  );
}
