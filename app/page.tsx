"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, FileText, AlertTriangle, CheckCircle, Shield, Zap, Lock } from "lucide-react";

interface AnalysisResult {
  riskScore: number;
  summary: string;
  flaggedClauses: Array<{
    type: string;
    severity: "high" | "medium" | "low";
    text: string;
    explanation: string;
    suggestion: string;
  }>;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.pdf') || selectedFile.name.endsWith('.doc') || selectedFile.name.endsWith('.docx')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please upload a PDF, Word document, or text file.");
      }
    }
  };

  const analyzeContract = async () => {
    if (!file) return;

    setAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to analyze contract. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-red-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return "High Risk";
    if (score >= 40) return "Medium Risk";
    return "Low Risk";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Contract Analyzer</span>
          </div>
          <nav className="flex gap-4">
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">Pricing</Button>
            <Button variant="outline">Sign In</Button>
            <Button>Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            AI-Powered Contract Review
            <br />
            <span className="text-blue-600">for Freelancers</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your contracts and get instant AI analysis. Identify risky clauses, 
            understand terms, and protect yourself before signing.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Analyze Your Contract</CardTitle>
            <CardDescription>
              Upload a PDF or Word document to get started. Free plan includes 3 analyses per month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  file ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="contract-upload"
                />
                <label htmlFor="contract-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 mb-2">
                    {file ? file.name : "Drop your contract here or click to browse"}
                  </p>
                  <p className="text-sm text-slate-400">
                    Supports PDF, Word, and text files
                  </p>
                </label>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={analyzeContract}
                disabled={!file || analyzing}
                className="w-full"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Zap className="mr-2 h-4 w-4 animate-pulse" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze Contract
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="max-w-4xl mx-auto mt-12 space-y-6">
            {/* Risk Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Risk Assessment
                  <Badge
                    className={`${getRiskColor(result.riskScore)} text-white`}
                  >
                    {getRiskLabel(result.riskScore)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Risk Score</span>
                    <span className="font-medium">{result.riskScore}/100</span>
                  </div>
                  <Progress value={result.riskScore} className="h-3" />
                  <p className="text-slate-600">{result.summary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Flagged Clauses */}
            {result.flaggedClauses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Flagged Clauses</CardTitle>
                  <CardDescription>
                    Review these clauses carefully before signing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.flaggedClauses.map((clause, index) => (
                      <Alert
                        key={index}
                        variant={clause.severity === "high" ? "destructive" : "default"}
                        className="border-l-4"
                        style={{
                          borderLeftColor:
                            clause.severity === "high"
                              ? "#ef4444"
                              : clause.severity === "medium"
                              ? "#f59e0b"
                              : "#22c55e",
                        }}
                      >
                        <div className="flex items-start gap-2">
                          {clause.severity === "high" ? (
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <AlertTitle className="flex items-center gap-2">
                              {clause.type}
                              <Badge
                                variant={
                                  clause.severity === "high"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {clause.severity}
                              </Badge>
                            </AlertTitle>
                            <AlertDescription className="mt-2 space-y-2">
                              <p className="text-sm italic bg-slate-100 p-2 rounded">
                                &ldquo;{clause.text}&rdquo;
                              </p>
                              <p>{clause.explanation}</p>
                              <div className="bg-blue-50 p-3 rounded-lg mt-2">
                                <p className="text-sm font-medium text-blue-900">
                                  Suggested Edit:
                                </p>
                                <p className="text-sm text-blue-800">
                                  {clause.suggestion}
                                </p>
                              </div>
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Simple Pricing</h2>
            <p className="text-slate-600 mt-2">Choose the plan that works for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For occasional contract reviews</CardDescription>
                <div className="text-3xl font-bold mt-4">$0</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>3 contract analyses per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Basic risk assessment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-blue-500 border-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Pro</CardTitle>
                    <CardDescription>For freelancers & agencies</CardDescription>
                  </div>
                  <Badge className="bg-blue-500">Popular</Badge>
                </div>
                <div className="text-3xl font-bold mt-4">
                  $29<span className="text-lg font-normal text-slate-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Unlimited contract analyses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Advanced risk assessment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Redline suggestions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Contract history & storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full mt-6">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-bold text-white">Contract Analyzer</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4" />
              <span>Your contracts are secure and never stored permanently</span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
            © 2026 Contract Analyzer by Huadini. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
