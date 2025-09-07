import Navbar from "../components/Navbar";
import Stepper from "../components/Stepper";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
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
  const { isDark } = useTheme();
  
  return (
    <div className="home-page">
      <Navbar />
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className={`absolute top-20 left-10 w-32 h-32 rounded-full blur-xl animate-pulse float ${
          isDark ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20" : "bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
        }`}></div>
        <div className={`absolute top-40 right-20 w-24 h-24 rounded-full blur-xl animate-pulse float ${
          isDark ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20" : "bg-gradient-to-r from-purple-500/10 to-pink-500/10"
        }`} style={{animationDelay: '2s'}}></div>
        <div className={`absolute bottom-32 left-1/4 w-40 h-40 rounded-full blur-xl animate-pulse float ${
          isDark ? "bg-gradient-to-r from-green-500/20 to-cyan-500/20" : "bg-gradient-to-r from-green-500/10 to-cyan-500/10"
        }`} style={{animationDelay: '4s'}}></div>
        <div className={`absolute bottom-20 right-1/3 w-28 h-28 rounded-full blur-xl animate-pulse float ${
          isDark ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20" : "bg-gradient-to-r from-yellow-500/10 to-orange-500/10"
        }`} style={{animationDelay: '1s'}}></div>
        
        {/* Grid Pattern */}
        <div className={`absolute inset-0 ${isDark ? "opacity-5" : "opacity-3"}`}>
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, ${isDark ? "0.1" : "0.05"}) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, ${isDark ? "0.1" : "0.05"}) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Neon Lines */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent ${isDark ? "opacity-50" : "opacity-30"}`}></div>
        <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent ${isDark ? "opacity-50" : "opacity-30"}`}></div>
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent ${isDark ? "opacity-50" : "opacity-30"}`}></div>
        <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-pink-500 to-transparent ${isDark ? "opacity-50" : "opacity-30"}`}></div>
      </div>

      <div className="page-container relative z-10">
        <div className="content-wrapper">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className={`text-5xl md:text-7xl font-bold bg-gradient-to-r bg-clip-text text-transparent animate-pulse drop-shadow-2xl ${
                isDark 
                  ? "from-cyan-400 via-blue-400 via-purple-400 to-pink-400" 
                  : "from-cyan-600 via-blue-600 via-purple-600 to-pink-600"
              }`}>
                Smart Timetable Scheduler
              </h1>
              <div className="relative">
                <p className={`section-subtitle text-xl font-medium bg-gradient-to-r bg-clip-text text-transparent ${
                  isDark 
                    ? "from-cyan-300 via-blue-300 to-purple-300" 
                    : "from-cyan-600 via-blue-600 to-purple-600"
                }`}>
                  Create optimized timetables with AI-powered scheduling. 
                  Streamline your academic planning with intelligent conflict resolution.
                </p>
                <div className={`absolute -inset-1 bg-gradient-to-r rounded-lg blur opacity-75 ${
                  isDark 
                    ? "from-cyan-500/20 via-blue-500/20 to-purple-500/20" 
                    : "from-cyan-500/10 via-blue-500/10 to-purple-500/10"
                }`}></div>
              </div>
            </div>
            
            <Stepper step={0} />
            
            <div className="mt-8 text-center">
              <div className="relative max-w-lg mx-auto">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-xl animate-pulse"></div>
                
                <div className="relative card max-w-lg mx-auto border-2 border-cyan-500/30 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl">
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center pulse-glow">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-lg animate-ping"></div>
                    </div>
                    <h3 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                      isDark 
                        ? "from-cyan-400 to-purple-400" 
                        : "from-cyan-700 to-purple-700"
                    }`}>Ready to Get Started?</h3>
                    <p className={`text-lg ${
                      isDark 
                        ? "text-slate-300" 
                        : "text-slate-700"
                    }`}>
                      Create your first optimized timetable in just a few steps
                    </p>
                    <Link href="/timeslots" className="btn-primary w-full text-lg py-4 gradient-animated">
                      🚀 Start Creating Timetable
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative card-compact text-center group hover:scale-110 transition-all duration-300 border-2 border-cyan-500/30 bg-gradient-to-br from-slate-900/80 to-slate-800/60">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center pulse-glow">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-lg animate-ping"></div>
                  </div>
                  <h4 className={`font-bold text-xl mb-3 bg-gradient-to-r bg-clip-text text-transparent ${
                    isDark 
                      ? "from-cyan-400 to-blue-400" 
                      : "from-cyan-700 to-blue-700"
                  }`}>Smart Scheduling</h4>
                  <p className={`${
                    isDark 
                      ? "text-slate-300" 
                      : "text-slate-700"
                  }`}>AI-powered optimization for conflict-free timetables</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative card-compact text-center group hover:scale-110 transition-all duration-300 border-2 border-purple-500/30 bg-gradient-to-br from-slate-900/80 to-slate-800/60">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center pulse-glow">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-lg animate-ping" style={{animationDelay: '0.5s'}}></div>
                  </div>
                  <h4 className={`font-bold text-xl mb-3 bg-gradient-to-r bg-clip-text text-transparent ${
                    isDark 
                      ? "from-purple-400 to-pink-400" 
                      : "from-purple-700 to-pink-700"
                  }`}>Fast Generation</h4>
                  <p className={`${
                    isDark 
                      ? "text-slate-300" 
                      : "text-slate-700"
                  }`}>Generate multiple timetable options in seconds</p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-cyan-500/30 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative card-compact text-center group hover:scale-110 transition-all duration-300 border-2 border-green-500/30 bg-gradient-to-br from-slate-900/80 to-slate-800/60">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center pulse-glow">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-green-500/20 to-cyan-500/20 blur-lg animate-ping" style={{animationDelay: '1s'}}></div>
                  </div>
                  <h4 className={`font-bold text-xl mb-3 bg-gradient-to-r bg-clip-text text-transparent ${
                    isDark 
                      ? "from-green-400 to-cyan-400" 
                      : "from-green-700 to-cyan-700"
                  }`}>Easy Management</h4>
                  <p className={`${
                    isDark 
                      ? "text-slate-300" 
                      : "text-slate-700"
                  }`}>Simple interface for managing all your schedules</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}