import { Card } from "@/components/ui/Card";

export default function CheckYourEmailPage() {
  return (
    <Card className="w-full max-w-sm text-center">
      <h1 className="font-display text-2xl">Check je mail 💛</h1>
      <p className="mt-3 text-sm text-muted">
        We hebben je een inloglink gestuurd. Klik op de link in de e-mail om
        verder te gaan. De link is 24 uur geldig.
      </p>
    </Card>
  );
}
