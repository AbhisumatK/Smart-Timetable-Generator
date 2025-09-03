import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  // Example role from session, adjust as needed based on your session shape
  const userRole = session?.user?.role || "";

  // Styling helper for active link
  function isActive(path) {
    return router.pathname === path
      ? "text-cyan-400 underline underline-offset-4 decoration-cyan-400"
      : "text-slate-300 hover:text-cyan-300";
  }

  return (
    <nav className="w-full sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/40 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-100 hover:text-cyan-300 cursor-pointer" onClick={() => router.push("/")}>
            Smart Timetable Scheduler
          </span>
          <Link href="/" className={`text-sm sm:text-base ${isActive("/")}`}>
            Home
          </Link>
          {session && (
            <>
              <Link href="/drafts" className={`text-sm sm:text-base ${isActive("/drafts")}`}>
                Drafts
              </Link>
              {userRole === "approver" && (
                <Link href="/approval" className={`text-sm sm:text-base ${isActive("/approval")}`}>
                  Approvals
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden sm:inline text-slate-400">
                Hello, {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="btn-secondary border border-slate-600/50"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="btn-primary border border-cyan-500/30"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}