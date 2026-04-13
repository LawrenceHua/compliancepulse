"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BUSINESS_TYPES = [
  { id: "restaurant", label: "Restaurant / Food Service", icon: "🍽️" },
  { id: "retail", label: "Retail Store", icon: "🛍️" },
  { id: "healthcare", label: "Healthcare / Medical", icon: "🏥" },
  { id: "fitness", label: "Gym / Fitness Studio", icon: "💪" },
  { id: "hotel", label: "Hotel / Hospitality", icon: "🏨" },
  { id: "other", label: "Other Regulated Business", icon: "🏢" },
];

const EMPLOYEE_COUNTS = [
  { id: "1-10", label: "1–10 employees" },
  { id: "11-50", label: "11–50 employees" },
  { id: "51-200", label: "51–200 employees" },
  { id: "200+", label: "200+ employees" },
];

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

const ADA_CHECKLIST = {
  common: [
    { id: "a1", task: "Conduct a full accessibility audit of your website (WCAG 2.1 AA standard)", priority: "high" },
    { id: "a2", task: "Fix all identified accessibility violations — images need alt text, forms need labels, navigation must be keyboard-navigable", priority: "high" },
    { id: "a3", task: "Publish an Accessibility Statement on your website", priority: "high" },
    { id: "a4", task: "Create a formal accessibility policy document", priority: "medium" },
    { id: "a5", task: "Train customer-facing staff on ADA requirements and how to assist disabled customers", priority: "medium" },
    { id: "a6", task: "Set up an internal process for handling accessibility complaints", priority: "medium" },
    { id: "a7", task: "Ensure your physical location is accessible (parking, entrances, restrooms)", priority: "high" },
    { id: "a8", task: "Review third-party vendors (ordering kiosks, reservation systems) for accessibility", priority: "medium" },
  ],
  restaurant: [
    { id: "r1", task: "Ensure your digital menu / online ordering is screen-reader accessible", priority: "high" },
    { id: "r2", task: "Ensure QR codes on tables link to accessible digital content", priority: "medium" },
  ],
  retail: [
    { id: "rt1", task: "Ensure your e-commerce checkout flow is keyboard-navigable", priority: "high" },
    { id: "rt2", task: "Make sure product images have descriptive alt text", priority: "medium" },
  ],
  healthcare: [
    { id: "h1", task: "Ensure patient portal and appointment booking system is fully accessible", priority: "high" },
    { id: "h2", task: "Ensure telehealth platform meets accessibility standards", priority: "high" },
  ],
};

type Step = 1 | 2 | 3 | 4;

export default function AssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [businessType, setBusinessType] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const toggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const canProceed = () => {
    if (step === 1) return !!businessType;
    if (step === 2) return !!employeeCount;
    if (step === 3) return selectedStates.length > 0;
    if (step === 4) return !!email;
    return false;
  };

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const checklist = [
      ...ADA_CHECKLIST.common,
      ...(ADA_CHECKLIST[businessType as keyof typeof ADA_CHECKLIST] || []),
    ].map((item) => ({ ...item, completed: false }));

    const body = {
      businessType,
      employeeCount,
      states: selectedStates,
      checklist,
      email,
    };

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Error submitting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checklist = [
    ...ADA_CHECKLIST.common,
    ...(ADA_CHECKLIST[businessType as keyof typeof ADA_CHECKLIST] || []),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <div className="text-xl font-bold tracking-tight">
          <span className="text-emerald-400">Compliance</span>Pulse
        </div>
        <div className="text-slate-500 text-sm">ADA Title II Assessment</div>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-16">
        {/* Progress */}
        <div className="flex gap-2 mb-12">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition ${
                s <= step ? "bg-emerald-500" : "bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Business Type */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold mb-2">What type of business do you run?</h1>
            <p className="text-slate-400 mb-8">We&apos;ll tailor your compliance checklist to your industry.</p>
            <div className="grid grid-cols-2 gap-3">
              {BUSINESS_TYPES.map((bt) => (
                <button
                  key={bt.id}
                  onClick={() => setBusinessType(bt.id)}
                  className={`p-4 rounded-xl border text-left transition ${
                    businessType === bt.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-900 hover:border-slate-500"
                  }`}
                >
                  <div className="text-2xl mb-1">{bt.icon}</div>
                  <div className="text-sm font-medium">{bt.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Employee Count */}
        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold mb-2">How many employees do you have?</h1>
            <p className="text-slate-400 mb-8">This helps us understand your compliance scope and risk level.</p>
            <div className="space-y-3">
              {EMPLOYEE_COUNTS.map((ec) => (
                <button
                  key={ec.id}
                  onClick={() => setEmployeeCount(ec.id)}
                  className={`w-full p-4 rounded-xl border text-left transition ${
                    employeeCount === ec.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-900 hover:border-slate-500"
                  }`}
                >
                  <div className="text-sm font-medium">{ec.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: States */}
        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold mb-2">What states do you operate in?</h1>
            <p className="text-slate-400 mb-2">
              {selectedStates.length === 0 ? "Select at least one state" : `${selectedStates.length} state(s) selected`}
            </p>
            <button
              onClick={() => setShowStatePicker(!showStatePicker)}
              className="text-emerald-400 text-sm mb-6 underline"
            >
              {showStatePicker ? "Hide state picker" : "Show state picker"}
            </button>

            {showStatePicker && (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  {STATES.map((state) => (
                    <button
                      key={state}
                      onClick={() => toggleState(state)}
                      className={`px-2 py-1.5 rounded-lg text-xs text-left transition ${
                        selectedStates.includes(state)
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-transparent"
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedStates.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedStates.map((s) => (
                  <span
                    key={s}
                    className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-full px-3 py-1 text-xs flex items-center gap-1"
                  >
                    {s}
                    <button onClick={() => toggleState(s)} className="ml-1 text-emerald-600 hover:text-emerald-400">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Email + Review */}
        {step === 4 && (
          <div>
            <h1 className="text-3xl font-bold mb-2">Almost done!</h1>
            <p className="text-slate-400 mb-8">
              Enter your email to save your assessment and get your personalized compliance checklist.
            </p>
            <input
              type="email"
              placeholder="you@yourbusiness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mb-6"
            />

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 mb-6">
              <h3 className="font-semibold mb-3 text-sm text-slate-400 uppercase tracking-wide">Your personalized checklist</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 border-2 border-slate-600 rounded flex-shrink-0" />
                    <span className={item.priority === "high" ? "text-white" : "text-slate-400"}>
                      {item.task}
                    </span>
                    {item.priority === "high" && (
                      <span className="ml-auto text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded px-1.5 py-0.5">High Priority</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-3">{checklist.length} total items · Customized for {BUSINESS_TYPES.find((b) => b.id === businessType)?.label}</p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-400">
              ✓ Free 14-day trial · $49/mo after · Cancel anytime
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-10">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition"
            >
              ← Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 py-3 rounded-xl font-bold transition ${
                canProceed()
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
              }`}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className={`flex-1 py-3 rounded-xl font-bold transition ${
                canProceed() && !loading
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
              }`}
            >
              {loading ? "Generating your checklist..." : "Get My Personalized Checklist →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
