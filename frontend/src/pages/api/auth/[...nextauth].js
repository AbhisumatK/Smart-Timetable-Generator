// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Or use GoogleProvider from "next-auth/providers/google" for Google sign-in

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
        return null;
      }
    })
    // Add more providers here (GoogleProvider, etc.)
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