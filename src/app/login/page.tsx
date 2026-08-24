import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requestMagicLink } from "./actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-accent-soft/40 px-4">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-lg font-semibold text-accent-foreground">
            YAH
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Sign in to YourAcademicHelp
          </h1>
          <p className="mt-1 text-sm text-muted">
            No password needed — we&apos;ll email you a magic link.
          </p>
        </div>

        <form action={requestMagicLink} className="space-y-3">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <Button type="submit" className="w-full">
            Send magic link
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          By continuing you agree this app only uses your email to sign you
          in — no public profile, nothing shared with other users.
        </p>
      </Card>
    </main>
  );
}
