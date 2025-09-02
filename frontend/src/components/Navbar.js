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
      ? "text-yellow-300 underline"
      : "hover:text-yellow-300";
  }

  return (
    <nav className="w-full bg-blue-600 text-white py-3 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <span className="font-bold text-xl cursor-pointer" onClick={() => router.push("/")}>
            Smart Timetable Scheduler
          </span>
          <Link href="/" className={`text-lg ${isActive("/")}`}>
            Home
          </Link>
          {session && (
            <>
              <Link href="/drafts" className={`text-lg ${isActive("/drafts")}`}>
                Drafts
              </Link>
              {userRole === "approver" && (
                <Link href="/approval" className={`text-lg ${isActive("/approval")}`}>
                  Approvals
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <span className="hidden sm:inline">Hello, {session.user.name || session.user.email}</span>
              <button
                onClick={() => signOut()}
                className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-3 py-1 rounded font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-3 py-1 rounded font-semibold"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}