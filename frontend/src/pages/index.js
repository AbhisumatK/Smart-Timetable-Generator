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
      <div className="page-container">
        <div className="content-wrapper">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Smart Timetable Scheduler
              </h1>
              <p className="section-subtitle text-lg">
                Create optimized timetables with AI-powered scheduling. 
                Streamline your academic planning with intelligent conflict resolution.
              </p>
            </div>
            
            <Stepper step={0} />
            
            <div className="mt-8 text-center">
              <div className="card max-w-lg mx-auto">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200">Ready to Get Started?</h3>
                  <p className="text-slate-400">
                    Create your first optimized timetable in just a few steps
                  </p>
                  <Link href="/timeslots" className="btn-primary w-full">
                    Start Creating Timetable
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="card-compact text-center group hover:scale-105 transition-transform">
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-200 mb-2">Smart Scheduling</h4>
                <p className="text-sm text-slate-400">AI-powered optimization for conflict-free timetables</p>
              </div>
              
              <div className="card-compact text-center group hover:scale-105 transition-transform">
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-200 mb-2">Fast Generation</h4>
                <p className="text-sm text-slate-400">Generate multiple timetable options in seconds</p>
              </div>
              
              <div className="card-compact text-center group hover:scale-105 transition-transform">
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-200 mb-2">Easy Management</h4>
                <p className="text-sm text-slate-400">Simple interface for managing all your schedules</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}