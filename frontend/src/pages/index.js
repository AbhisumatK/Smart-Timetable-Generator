import Navbar from "../components/Navbar";
import Stepper from "../components/Stepper";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center mt-16">
        <h1 className="text-3xl font-bold mb-4">Smart Timetable Scheduler</h1>
        <Stepper step={0} />
        <div className="mt-6">
          <p>Welcome! Start by entering your time slots.</p>
          <Link href="/timeslots" className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded">
            Start
          </Link>
        </div>
      </div>
    </>
  );
}