import { useState } from "react";
import { useRouter } from "next/router";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await registerUser(email, password, name, role);
      router.push("/sign-in");
    } catch (err) {
      setError(err?.message || "Registration failed");
      setLoading(false);
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Admin Registration
          </h1>
          <p className={isDark ? "text-slate-400" : "text-slate-600"}>Create an admin account</p>
        </div>

        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg text-sm p-3 text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="label">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Your full name"
                aria-label="Name"
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@college.edu"
                aria-label="Email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Set your password"
                aria-label="Password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Re-enter your password"
                aria-label="Confirm Password"
              />
            </div>

            <div>
              <label htmlFor="role" className="label">Role</label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`input ${isDark ? "text-slate-200 bg-slate-800/50" : "text-slate-700 bg-white"}`}
                aria-label="Role"
              >
                <option value="staff">Staff</option>
                <option value="approver">Approver</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>

            <div className="text-center text-sm text-slate-400">
              Already have an account? <a href="/sign-in" className="text-cyan-400 hover:text-cyan-300">Sign in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}