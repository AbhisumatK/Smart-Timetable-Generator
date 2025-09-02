import "@/styles/globals.css";
import { SchedulerProvider } from '../context/SchedulerContext'
import { SessionProvider } from "next-auth/react";
import { getSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  
  useEffect(() => {
    getSession().then(session => {
      if (!session) signIn();
    });
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      <SchedulerProvider>
        <Component {...pageProps} />
      </SchedulerProvider>
    </SessionProvider>
  )
}
