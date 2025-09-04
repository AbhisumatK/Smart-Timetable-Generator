import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        // Replace with real user lookup (DB/API)
        if (credentials.username === "admin@college.edu" && credentials.password === "password123") {
          return { userId: 1, name: "Admin", email: credentials.username, role: "admin" };
        }
        if (credentials.username === "approver@college.edu" && credentials.password === "password123") {
          return { userId: 1, name: "Approver", email: credentials.username, role: "approver" };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user info to session
      session.user.role = token.role || "staff";
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
  }
});