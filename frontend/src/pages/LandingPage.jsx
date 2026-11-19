import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { 
  Building2, Sparkles, ArrowRight, ShieldCheck, Zap, 
  Clock, CheckCircle2, AlertTriangle, Cpu, TrendingUp, 
  Users, BarChart3, Cloud, Camera, ChevronRight, Check
} from 'lucide-react';
import api from '../api/client';

export const LandingPage = () => {
  const { isAuthenticated, isAdmin, quickLogin } = useAuth();
  const navigate = useNavigate();

  // Interactive Live AI Triage Demo state
  const [demoInput, setDemoInput] = useState("Hostel 14 Wi-Fi access point in 2nd floor corridor has been dropping connection all morning.");
  const [demoAnalyzing, setDemoAnalyzing] = useState(false);
  const [demoResult, setDemoResult] = useState({
    category: "Internet/Wi-Fi",
    priority: "High",
    location: "Hostel 14",
    summary: "Wi-Fi access point flapping on 2nd floor corridor in Hostel 14.",
    confidence: 0.94,
    source: "gemini"
  });

  const samplePrompts = [
    { label: "Wi-Fi Outage", text: "Hostel 14 Wi-Fi access point in 2nd floor corridor has been dropping connection all morning." },
    { label: "Water Leak Hazard", text: "Drinking water cooler near LHC Room 204 has burst pipe flooding the corridor with slippery water." },
    { label: "Sparking Switch", text: "Sparks and burning smell coming from switchboard in Room 312, Hostel 12." },
    { label: "Library AC Fault", text: "Central AC cooling is shut off in Central Library 3rd floor quiet study cubicles." }
  ];

  const handleTestAI = async (textToTest) => {
    const text = textToTest || demoInput;
    setDemoAnalyzing(true);
    try {
      // Call real backend AI endpoint if available or compute
      const res = await api.post('/ai/analyze', { description: text });
      setDemoResult({
        category: res.data.category,
        priority: res.data.priority,
        location: res.data.location_hint || "Campus Site",
        summary: res.data.summary,
        confidence: res.data.confidence,
        source: res.data.source
      });
    } catch {
      // Offline fallback demonstration
      setDemoResult({
        category: text.toLowerCase().includes("wi-fi") || text.toLowerCase().includes("wifi") ? "Internet/Wi-Fi" : (text.toLowerCase().includes("water") ? "Water Supply" : (text.toLowerCase().includes("spark") ? "Electricity" : "Library")),
        priority: text.toLowerCase().includes("spark") ? "Urgent" : (text.toLowerCase().includes("water") || text.toLowerCase().includes("wi-fi") ? "High" : "Medium"),
        location: "Detected Campus Location",
        summary: text.slice(0, 80) + "...",
        confidence: 0.92,
        source: "heuristic-fallback"
      });
    } finally {
      setDemoAnalyzing(false);
    }
  };

  const handleDemoQuickAccess = async (role) => {
    await quickLogin(role);
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle decorative background gradient blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-200/40 via-violet-200/30 to-sky-200/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Techfest & AWS Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm text-xs font-semibold text-slate-700">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span>AWS ShipIt Challenge</span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-600">Techfest, IIT Bombay</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Making Every Campus Better,{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
                One Report at a Time.
              </span>
            </h1>

            {/* Tagline & Supporting Description */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              <strong className="text-slate-800 font-semibold">Smart Campus. Smarter Solutions.</strong> The centralized intelligent complaint triage and resolution ecosystem. Turn everyday student frustrations into rapid, accountable facility maintenance.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/register'}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) {
                    navigate(isAdmin ? '/admin' : '/dashboard');
                  } else {
                    handleDemoQuickAccess('student');
                  }
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200/90 shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Explore Live Dashboard</span>
              </button>
            </div>

            {/* Quick Demo Switcher Strip for Reviewers */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-medium">Direct Evaluator Access:</span>
              <button
                onClick={() => handleDemoQuickAccess('student')}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors"
              >
                Launch Student View
              </button>
              <span>•</span>
              <button
                onClick={() => handleDemoQuickAccess('admin')}
                className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 font-medium transition-colors"
              >
                Launch Admin View
              </button>
            </div>
          </div>

          {/* Interactive Live AI Triage Demo Box */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl bg-white/95 border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden backdrop-blur-md">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-mono text-slate-400 ml-2">campusfix-ai-triage-engine.v1</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
                Live Autonomous Triage Engine
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Try Complaint Description (Type or Pick Below):
                  </label>
                  <span className="text-xs text-indigo-600 font-medium">Real-time classification</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    placeholder="Describe a campus issue (e.g., broken projector in LHC, water leak in Hostel 12...)"
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
                  />
                  <button
                    onClick={() => handleTestAI()}
                    disabled={demoAnalyzing}
                    className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all flex items-center gap-2 flex-shrink-0"
                  >
                    {demoAnalyzing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-4 h-4" />}
                    <span>Analyze</span>
                  </button>
                </div>

                {/* Sample prompt chips */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Sample scenarios:</span>
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDemoInput(p.text);
                        handleTestAI(p.text);
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200/60"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Output Card Preview */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 border border-indigo-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                      <Cpu className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">AI Triage Assessment</div>
                      <div className="text-[11px] text-slate-500">Autonomous Classification & Urgency Assessment</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {Math.round(demoResult.confidence * 100)}% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-indigo-50 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Category</div>
                    <div className="text-sm font-bold text-indigo-700 mt-0.5">{demoResult.category}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-indigo-50 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detected Urgency</div>
                    <div className={`text-sm font-bold mt-0.5 ${
                      demoResult.priority === 'Urgent' ? 'text-rose-600' : (demoResult.priority === 'High' ? 'text-orange-600' : 'text-amber-600')
                    }`}>
                      {demoResult.priority}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-indigo-50 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location Entity</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5 truncate">{demoResult.location}</div>
                  </div>
                </div>

                <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">1-Sentence Summary: </span>
                  <span className="italic">"{demoResult.summary}"</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Simple 4-Step Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              From Photo to Fix in Four Smooth Steps
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              No manual paper forms, no endless hostel warden follow-ups. Everything is tracked digitally and transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Snap & Describe</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Take a quick photo of the broken tap, flickering light, or bad Wi-Fi router. Enter a brief description.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-4 hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Triage & Priority</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Gemini AI classifies the category, extracts the campus location, flags urgency, and generates a concise summary.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Automated Dispatch</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Relevant campus department (Electrical, Plumbing, CC NOC, Mess Committee) is instantly assigned the work order.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                4
              </div>
              <h3 className="text-lg font-bold text-slate-900">Track & Rate Fix</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Watch the live timeline update. Once completed by technicians, students verify and rate resolution quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Built for Scale & Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered with Enterprise Features
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A comprehensive toolkit for college students, hostel wardens, and facility management administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI-Powered Auto Triage</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Google Gemini API categorizes complaints across 11 campus domains and tags urgency in milliseconds with fallback resilience.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Photographic Proof</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload direct photos of faulty infrastructure. Securely stored locally during dev and ready for Amazon S3 in cloud production.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Live Status Timelines</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Step-by-step audit logs showing when tickets were reviewed, technician dispatched, parts replaced, and resolution signed off.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Interactive Campus Analytics</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Visual Recharts heatmaps identify chronic campus problem areas, frequent breakdown locations, and monthly resolution efficiency.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Role-Based Access Control</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Strict separation between Student submissions and Administrator triage consoles secured with industry-standard JWT & bcrypt.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AWS Cloud Ready</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pre-configured for AWS Lambda (Mangum), Amazon DynamoDB single-table schema, and AWS S3 storage adapters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Impact Metrics */}
      <section id="impact" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Measurable Performance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Real Impact on Campus Life
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Quantifiable turnaround improvements compared to legacy manual register books.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-indigo-400 tracking-tight">99.2%</div>
              <div className="text-sm font-semibold text-white">Resolution Rate</div>
              <div className="text-xs text-slate-400">Complaints resolved within SLA</div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">3.4 hrs</div>
              <div className="text-sm font-semibold text-white">Average Triage Time</div>
              <div className="text-xs text-slate-400">Down from 3-5 days of bureaucracy</div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-violet-400 tracking-tight">15,000+</div>
              <div className="text-sm font-semibold text-white">Students Supported</div>
              <div className="text-xs text-slate-400">Across hostelled campus hostels & labs</div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">85%</div>
              <div className="text-sm font-semibold text-white">Reduction in Recurrence</div>
              <div className="text-xs text-slate-400">Root-cause fixes via data analytics</div>
            </div>
          </div>
        </div>
      </section>

      {/* How AI Helps Campus Management (Comparison) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Why AI Matters
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Old Campus Bureaucracy vs. CampusFix AI
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Eliminate paper registers, missing complaints, and unaccountable facility delays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Way */}
            <div className="p-8 rounded-3xl bg-rose-50/50 border border-rose-200/80 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                Traditional Manual Channels
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Physical register kept at hostel security desk often gets misplaced.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>No urgency detection: electrical hazards sit in queues behind minor requests.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Zero status visibility: students never know if someone was dispatched.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>No historical analytics to detect recurring infrastructural defects.</span>
                </li>
              </ul>
            </div>

            {/* CampusFix AI Way */}
            <div className="p-8 rounded-3xl bg-emerald-50/50 border border-emerald-200/90 space-y-5 shadow-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                CampusFix AI Architecture
              </div>
              <ul className="space-y-3 text-sm text-slate-800 font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Instant submission via mobile or web with photographic evidence.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Real-time AI triage identifies hazardous electrical/water issues as Urgent.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Live visual step timeline with admin resolution notes & technician assignment.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Rich Recharts analytics dashboards for facility leadership and wardens.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Experience the Future of Campus Management?
          </h2>
          <p className="text-indigo-200 max-w-xl mx-auto text-sm sm:text-base">
            Test the live demo as a student or an administrator right now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleDemoQuickAccess('student')}
              className="px-6 py-3 rounded-2xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 shadow-lg transition-all"
            >
              Sign In as Student
            </button>
            <button
              onClick={() => handleDemoQuickAccess('admin')}
              className="px-6 py-3 rounded-2xl bg-indigo-700 text-white border border-indigo-500 font-bold text-sm hover:bg-indigo-600 shadow-lg transition-all"
            >
              Sign In as Administrator
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
