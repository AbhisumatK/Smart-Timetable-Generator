import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Example role from session, adjust as needed based on your session shape
  const userRole = session?.user?.role || "";

  // Styling helper for active link
  function isActive(path) {
    return router.pathname === path
      ? "text-cyan-400 underline underline-offset-4 decoration-cyan-400"
      : "text-slate-300 hover:text-cyan-300";
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

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
            <div className="relative" ref={menuRef}>
              <button
                className="card-compact inline-flex items-center gap-2 pl-3 pr-2 py-1.5 hover:bg-slate-800/60 border border-slate-600/50 rounded-lg text-slate-200"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="hidden sm:inline text-slate-300">
                  Hello, {session.user.name || session.user.email}
                </span>
                <svg className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-700/50 bg-slate-900/90 backdrop-blur shadow-lg shadow-slate-900/30 py-1"
                >
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/70"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A10 10 0 1118.88 4.196 10 10 0 015.12 17.804z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Profile
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/70"
                    role="menuitem"
                  >
                    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
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