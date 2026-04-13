"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ADA_DEADLINE = new Date("2026-04-24T00:00:00Z");

function getDaysLeft() {
  return Math.max(0, Math.ceil((ADA_DEADLINE.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

const DEFAULT_CHECKLIST = [
  { id: "a1", task: "Conduct a full accessibility audit of your website (WCAG 2.1 AA standard)", priority: "high", completed: false },
  { id: "a2", task: "Fix all identified accessibility violations — images need alt text, forms need labels, navigation must be keyboard-navigable", priority: "high", completed: false },
  { id: "a3", task: "Publish an Accessibility Statement on your website", priority: "high", completed: false },
  { id: "a4", task: "Create a formal accessibility policy document", priority: "medium", completed: false },
  { id: "a5", task: "Train customer-facing staff on ADA requirements and how to assist disabled customers", priority: "medium", completed: false },
  { id: "a6", task: "Set up an internal process for handling accessibility complaints", priority: "medium", completed: false },
  { id: "a7", task: "Ensure your physical location is accessible (parking, entrances, restrooms)", priority: "high", completed: false },
  { id: "a8", task: "Review third-party vendors (ordering kiosks, reservation systems) for accessibility", priority: "medium", completed: false },
];

export default function DashboardPage() {
  const [daysLeft, setDaysLeft] = useState(getDaysLeft);
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setDaysLeft(getDaysLeft()), 60000);
    return () => clearInterval(timer);
  }, []);

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);
  const riskLevel = daysLeft <= 7 ? "critical" : daysLeft <= 15 ? "high" : "medium";
  const riskColor = riskLevel === "critical" ? "text-red-400" : riskLevel === "high" ? "text-orange-400" : "text-yellow-400";

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <div className="text-xl font-bold tracking-tight">
          <span className="text-emerald-400">Compliance</span>Pulse
        </div>
        <div className="flex gap-4 items-center text-sm">
          <span className="text-slate-400">My Dashboard</span>
          <Link href="/" className="text-slate-500 hover:text-white transition">Home</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Deadline Banner */}
        <div className={`border rounded-2xl p-6 mb-8 ${riskLevel === "critical" ? "bg-red-500/10 border-red-500/30" : "bg-orange-500/10 border-orange-500/30"}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${riskColor}`}>
                {riskLevel === "critical" ? "⏰ CRITICAL — Deadline imminent" : "⏰ HIGH PRIORITY — Time is running out"}
              </div>
              <h1 className="text-3xl font-black mb-1">
                ADA Title II Deadline
              </h1>
              <p className="text-slate-400 text-sm">
                April 24, 2026 · Non-compliance penalties: <span className="text-red-400 font-semibold">$75,000–$150,000</span>
              </p>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-black ${riskColor}`}>{daysLeft}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">days left</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>{completedCount}/{totalCount} checklist items completed</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Compliance Score + Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Compliance Score", val: progressPct, suffix: "%", color: "text-emerald-400" },
            { label: "Days to Deadline", val: daysLeft, suffix: "", color: riskColor },
            { label: "Items Remaining", val: totalCount - completedCount, suffix: "", color: "text-slate-400" },
          ].map(({ label, val, suffix, color }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
              <div className={`text-3xl font-black ${color}`}>{val}{suffix}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Checklist */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Your Compliance Checklist</h2>
              <span className="text-xs text-slate-500">{completedCount}/{totalCount} done</span>
            </div>
            <div className="space-y-2">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition ${
                    item.completed ? "bg-emerald-500/5" : "bg-slate-800/50 hover:bg-slate-800"
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition ${
                    item.completed ? "bg-emerald-500 border-emerald-500" : "border-slate-600"
                  }`}>
                    {item.completed && <span className="text-xs text-slate-950 font-bold">✓</span>}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm ${item.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                      {item.task}
                    </span>
                    {item.priority === "high" && (
                      <span className="ml-2 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded px-1.5 py-0.5">High</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Upgrade Prompt */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="text-xs text-emerald-400 font-medium uppercase tracking-wider mb-2">Starter Plan</div>
              <div className="text-2xl font-black mb-1">$49<span className="text-sm font-normal text-slate-400">/mo</span></div>
              <p className="text-slate-500 text-xs mb-4">14-day free trial active</p>
              <button
                onClick={() => setShowUpgrade(!showUpgrade)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg text-sm transition"
              >
                Upgrade to Pro
              </button>
              {showUpgrade && (
                <div className="mt-3 p-3 bg-slate-800 rounded-lg text-xs text-slate-400">
                  Pro features: unlimited locations, Slack alerts, custom regulations, API access. Coming soon!
                </div>
              )}
            </div>

            {/* Reminders */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold mb-3">Upcoming Reminders</h3>
              <div className="space-y-2">
                {[
                  { days: daysLeft, label: "ADA Title II deadline", urgent: daysLeft <= 7 },
                  { days: 14, label: "Weekly checklist review", urgent: false },
                  { days: 30, label: "Monthly compliance audit", urgent: false },
                ].map(({ days, label, urgent }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${urgent ? "bg-red-400 animate-pulse" : "bg-slate-600"}`} />
                    <span className="text-slate-400">{days}d</span>
                    <span className={urgent ? "text-red-400 font-medium" : "text-slate-300"}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Report */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold mb-3">Shareable Report</h3>
              <p className="text-slate-500 text-xs mb-3">Generate a compliance status report to share with stakeholders or your legal team.</p>
              <button className="w-full border border-slate-700 hover:border-slate-500 text-slate-300 py-2 rounded-lg text-sm transition">
                Download PDF Report
              </button>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-600">
            ⚠️ CompliancePulse provides general compliance guidance and checklists. This is not legal advice. 
            Consult with a licensed attorney in your jurisdiction for advice specific to your business.
          </p>
        </div>
      </div>
    </div>
  );
}
