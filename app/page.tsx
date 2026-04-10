"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertTriangle,
  Calendar,
  Bell,
  Shield,
  ArrowRight,
  Clock,
  DollarSign,
  FileCheck,
  Users,
} from "lucide-react";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const deadline = new Date("2026-04-24");
  const today = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        // User closed popup, don't show error
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartFreeTrial = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sign in with Google first if not already signed in
      if (!auth.currentUser) {
        await signInWithPopup(auth, provider);
      }
      // Redirect to Stripe checkout
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err: any) {
      setError(err.message || "Failed to start free trial. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">CompliancePulse</span>
          </div>
          <nav className="flex gap-4">
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">Pricing</Button>
            <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading}>
              Sign In
            </Button>
            <Button onClick={handleStartFreeTrial} disabled={loading}>
              Start Free Trial
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge variant="destructive" className="mb-4 px-4 py-1 text-sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            URGENT: {daysLeft} Days Left
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            ADA Title II Deadline:
            <br />
            <span className="text-red-600">April 24, 2026 — Are you ready?</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            15 days left. Non-compliance = lawsuits + $75K-$150K fines. Don&apos;t let your
            business become a statistic.
          </p>
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          <Card className="text-center border-2 border-blue-100">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>1. Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Sign up in 30 seconds with Google. No credit card required to start.</p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-blue-100">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>2. Get Your Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Answer a few questions about your business. Get a personalized ADA compliance checklist.</p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-blue-100">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>3. Set Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">We&apos;ll send you email reminders before each compliance deadline.</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing */}
        <Card className="max-w-md mx-auto border-2 border-blue-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>CompliancePulse Starter</CardTitle>
                <CardDescription>Everything you need for ADA Title II compliance</CardDescription>
              </div>
              <Badge className="bg-blue-500">Most Popular</Badge>
            </div>
            <div className="text-3xl font-bold mt-4">
              $49<span className="text-lg font-normal text-slate-500">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>ADA Title II compliance checklist</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Email reminders before deadlines</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>1 business coverage</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>WCAG 2.1 AA guidance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Compliance health score tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Priority support</span>
              </li>
            </ul>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            <Button
              className="w-full mt-6"
              size="lg"
              onClick={handleStartFreeTrial}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-xs text-slate-500 mt-3 text-center">
              14-day free trial. Cancel anytime.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Urgency Section */}
      <section className="bg-red-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            The Clock is Ticking
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            ADA Title II web accessibility requirements apply to ALL state and local government websites.
            Private businesses serving the public are also increasingly targeted. The average lawsuit costs
            $75K-$150K in legal fees + settlements.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <DollarSign className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">$75K-$150K</div>
              <div className="text-sm text-slate-600">Potential fines per violation</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Calendar className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">15 Days</div>
              <div className="text-sm text-slate-600">Until April 24 deadline</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-900">2-4 Hours</div>
              <div className="text-sm text-slate-600">Time to get compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-bold text-white">CompliancePulse</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Your compliance data is secure and never shared</span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
            © 2026 CompliancePulse by Huadini. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
