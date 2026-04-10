import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { email, businessType, employeeCount, states, checklist } = await req.json();

    if (!email || !businessType || !employeeCount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // For MVP: store assessment in Firestore (anonymous user for now)
    const assessmentData = {
      email,
      businessType,
      employeeCount,
      states: states || [],
      checklist: checklist || [],
      score: 0,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "assessments"), assessmentData);

    return NextResponse.json({
      success: true,
      assessmentId: docRef.id,
      message: "Assessment saved. Redirecting to dashboard...",
    });
  } catch (error) {
    console.error("Assessment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
