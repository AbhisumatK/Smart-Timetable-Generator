import "@/styles/globals.css";
import { SchedulerProvider } from '../context/SchedulerContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from "react";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <InnerApp Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}

function InnerApp({ Component, pageProps }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Component.auth && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [Component, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated !== undefined) setLoading(false);
  }, [isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>; // Replace with your spinner if you have one
  }

  return (
    <ThemeProvider>
      <SchedulerProvider>
        <Component {...pageProps} />
      </SchedulerProvider>
    </ThemeProvider>
  );
}