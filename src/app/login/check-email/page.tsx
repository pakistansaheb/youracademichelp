import { Card } from "@/components/ui/card";

export default function CheckEmailPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-accent-soft/40 px-4">
      <Card className="w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-confidence-green-soft text-2xl">
          ✉️
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-muted">
          If that address has (or can have) an account, a sign-in link is on
          its way. It expires in 24 hours.
        </p>
      </Card>
    </main>
  );
}
