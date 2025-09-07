import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Role from your custom user object
  const userRole = user?.role || "";

  // Styling helper for active link
  function isActive(path) {
    const baseClasses = "px-3 py-1.5 rounded-lg transition-all duration-300";
    const activeClasses = isDark
      ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
      : "text-cyan-700 bg-cyan-500/25 border border-cyan-500/50 shadow-lg shadow-cyan-500/40";
    const inactiveClasses = isDark
      ? "text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/20"
      : "text-slate-700 hover:text-cyan-700 hover:bg-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/40";

    return router.pathname === path
      ? `${baseClasses} ${activeClasses}`
      : `${baseClasses} ${inactiveClasses}`;
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }
    if (menuOpen || mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, mobileMenuOpen]);

  return (
    <nav
      className={`w-full sticky top-0 z-40 border-b backdrop-blur-xl shadow-lg transition-all duration-300 ${
        isDark
          ? "border-cyan-500/20 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 shadow-cyan-500/10"
          : "border-cyan-500/30 bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 shadow-cyan-500/20"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 sm:gap-6">
          <span
            className={`font-bold text-sm sm:text-lg md:text-xl tracking-tight bg-gradient-to-r bg-clip-text text-transparent cursor-pointer truncate transition-all duration-300 hover:scale-105 ${
              isDark
                ? "from-cyan-400 via-blue-400 to-purple-400 hover:from-cyan-300 hover:via-blue-300 hover:to-purple-300"
                : "from-cyan-700 via-blue-700 to-purple-700 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600"
            }`}
            onClick={() => router.push("/")}
          >
            <span className="hidden sm:inline">Smart Timetable Scheduler</span>
            <span className="sm:hidden">STS</span>
          </span>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className={`text-sm ${isActive("/")}`}>
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/drafts" className={`text-sm ${isActive("/drafts")}`}>
                  Drafts
                </Link>
                {userRole === "approver" && (
                  <Link href="/approval" className={`text-sm ${isActive("/approval")}`}>
                    Approvals
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              isDark
                ? "text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/20 hover:shadow-cyan-500/20"
                : "text-slate-700 hover:text-cyan-700 hover:bg-cyan-500/25 hover:shadow-cyan-500/40"
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {/* Mobile Menu Button */}
          <div className="md:hidden relative" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className={`p-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                isDark
                  ? "text-slate-300 hover:text-cyan-300 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:shadow-cyan-500/20"
                  : "text-slate-700 hover:text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-500/25 hover:to-blue-500/25 hover:shadow-cyan-500/40"
              }`}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            {mobileMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-xl backdrop-blur-xl shadow-2xl py-2 animate-in slide-in-from-top-2 duration-300 ${
                  isDark
                    ? "border border-cyan-500/30 bg-gradient-to-br from-slate-900/95 to-slate-800/95 shadow-cyan-500/20"
                    : "border border-cyan-500/50 bg-gradient-to-br from-white/95 to-slate-50/95 shadow-cyan-500/40"
                }`}
              >
                <Link
                  href="/"
                  className={`block px-4 py-2 text-sm transition-all duration-300 hover:shadow-lg ${
                    isDark
                      ? "text-slate-200 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-cyan-300 hover:shadow-cyan-500/20"
                      : "text-slate-700 hover:bg-gradient-to-r hover:from-cyan-500/25 hover:to-blue-500/25 hover:text-cyan-700 hover:shadow-cyan-500/40"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/drafts"
                      className={`block px-4 py-2 text-sm transition-all duration-300 hover:shadow-lg ${
                        isDark
                          ? "text-slate-200 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-cyan-300 hover:shadow-cyan-500/20"
                          : "text-slate-700 hover:bg-gradient-to-r hover:from-cyan-500/25 hover:to-blue-500/25 hover:text-cyan-700 hover:shadow-cyan-500/40"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Drafts
                    </Link>
                    {userRole === "approver" && (
                      <Link
                        href="/approval"
                        className={`block px-4 py-2 text-sm transition-all duration-300 hover:shadow-lg ${
                          isDark
                            ? "text-slate-200 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-cyan-300 hover:shadow-cyan-500/20"
                            : "text-slate-700 hover:bg-gradient-to-r hover:from-cyan-500/25 hover:to-blue-500/25 hover:text-cyan-700 hover:shadow-cyan-500/40"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Approvals
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                className={`group card-compact inline-flex items-center gap-1 sm:gap-2 pl-2 sm:pl-3 pr-2 py-1.5 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  isDark
                    ? "hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 hover:text-cyan-300 focus:bg-gradient-to-r focus:from-cyan-500/20 focus:to-blue-500/20 focus:border-cyan-400/50 focus:text-cyan-300 active:bg-gradient-to-r active:from-cyan-500/30 active:to-blue-500/30 active:border-cyan-400/70 active:text-cyan-200 border border-slate-600/50 text-slate-200 hover:shadow-cyan-500/20"
                    : "hover:bg-gradient-to-r hover:from-cyan-500/25 hover:to-blue-500/25 hover:border-cyan-400/60 hover:text-cyan-700 focus:bg-gradient-to-r focus:from-cyan-500/25 focus:to-blue-500/25 focus:border-cyan-400/60 focus:text-cyan-700 active:bg-gradient-to-r active:from-cyan-500/35 active:to-blue-500/35 active:border-cyan-400/80 active:text-cyan-800 border border-slate-400/60 text-slate-700 hover:shadow-cyan-500/40"
                }`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span
                  className={`hidden sm:inline ${
                    isDark
                      ? "text-slate-300 group-hover:text-cyan-300 group-focus:text-cyan-300 group-active:text-cyan-200"
                      : "text-slate-700 group-hover:text-cyan-700 group-focus:text-cyan-700 group-active:text-cyan-800"
                  }`}
                >
                  Hello, {user.name || user.email}
                </span>
                <span
                  className={`sm:hidden text-xs ${
                    isDark
                      ? "text-slate-300 group-hover:text-cyan-300 group-focus:text-cyan-300 group-active:text-cyan-200"
                      : "text-slate-700 group-hover:text-cyan-700 group-focus:text-cyan-700 group-active:text-cyan-800"
                  }`}
                >
                  {user.name?.split(" ")[0] || user.email?.split("@")[0] || "User"}
                </span>
                <svg
                  className={`h-4 w-4 transition-all duration-200 ${
                    menuOpen ? "rotate-180" : "rotate-0"
                  } ${
                    isDark
                      ? "text-slate-400 group-hover:text-cyan-300 group-focus:text-cyan-300 group-active:text-cyan-200"
                      : "text-slate-500 group-hover:text-cyan-700 group-focus:text-cyan-700 group-active:text-cyan-800"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className={`absolute right-0 mt-2 w-44 rounded-xl backdrop-blur-xl shadow-2xl py-1 animate-in slide-in-from-top-2 duration-300 ${
                    isDark
                      ? "border border-cyan-500/30 bg-gradient-to-br from-slate-900/95 to-slate-800/95 shadow-cyan-500/20"
                      : "border border-cyan-500/50 bg-gradient-to-br from-white/95 to-slate-50/95 shadow-cyan-500/40"
                  }`}
                >
                  <Link
                    href="/profile"
                    className={`flex items-center gap-2 px-3 py-2 text-sm transition-all duration-300 hover:shadow-lg ${
                      isDark
                        ? "text-slate-200 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:text-cyan-300 hover:shadow-cyan-500/20"
                        : "text-slate-700 hover:bg-gradient-to-r hover:from-cyan-500/25 hover:to-blue-500/25 hover:text-cyan-700 hover:shadow-cyan-500/40"
                    }`}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg
                      className={`h-4 w-4 ${
                        isDark ? "text-slate-400 group-hover:text-cyan-300" : "text-slate-500 group-hover:text-cyan-700"
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A10 10 0 1118.88 4.196 10 10 0 015.12 17.804z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm transition-all duration-300 hover:shadow-lg ${
                      isDark
                        ? "text-slate-200 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 hover:text-red-300 hover:shadow-red-500/20"
                        : "text-slate-700 hover:bg-gradient-to-r hover:from-red-500/25 hover:to-pink-500/25 hover:text-red-700 hover:shadow-red-500/40"
                    }`}
                    role="menuitem"
                  >
                    <svg
                      className={`h-4 w-4 ${
                        isDark ? "text-slate-400 group-hover:text-red-300" : "text-slate-500 group-hover:text-red-700"
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push("/sign-in")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold text-sm px-4 py-2 rounded-lg border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}