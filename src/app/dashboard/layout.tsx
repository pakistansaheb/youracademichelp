import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { signOutAction } from "./actions";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.onboardingComplete) redirect("/onboarding");

  return (
    <div className="min-h-screen flex-1 bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <a href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-xs font-semibold text-accent-foreground">
              YAH
            </span>
            <span className="font-semibold text-foreground">
              YourAcademicHelp
            </span>
          </a>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-sm text-muted hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
