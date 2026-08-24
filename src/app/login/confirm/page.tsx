import { Card } from "@/components/ui/card";

function resolveSafeNext(next: string | undefined): string | null {
  if (!next) return null;
  try {
    const parsed = new URL(next);
    const expectedOrigin = process.env.AUTH_URL
      ? new URL(process.env.AUTH_URL).origin
      : parsed.origin;
    if (parsed.origin === expectedOrigin && parsed.pathname === "/api/auth/callback/resend") {
      return next;
    }
  } catch {
    // fall through
  }
  return null;
}

export default async function ConfirmSignInPage({
  searchParams,
}: PageProps<"/login/confirm">) {
  const { next } = await searchParams;
  const safeNext = resolveSafeNext(typeof next === "string" ? next : undefined);

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-accent-soft/40 px-4">
      <Card className="w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-lg font-semibold text-accent-foreground">
          YAH
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Confirm it&apos;s you
        </h1>

        {safeNext ? (
          <>
            <p className="mt-2 text-sm text-muted">
              One more click to finish signing in to YourAcademicHelp.
            </p>
            <a
              href={safeNext}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Confirm sign-in
            </a>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">
            This sign-in link is invalid.{" "}
            <a href="/login" className="text-accent underline">
              Request a new one
            </a>
            .
          </p>
        )}
      </Card>
    </main>
  );
}
