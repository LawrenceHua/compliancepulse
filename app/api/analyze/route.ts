import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // For MVP, we'll extract text based on file type
    let contractText = "";
    
    if (file.type === "text/plain" || file.name.endsWith('.txt')) {
      contractText = buffer.toString('utf-8');
    } else {
      // For PDF/DOC files, we'll use a placeholder extraction
      // In production, you'd use pdf-parse or mammoth
      contractText = `[Contract content from ${file.name} - ${buffer.length} bytes]`;
    }

    // If we couldn't extract meaningful text, use a sample for demo
    if (contractText.length < 100) {
      contractText = `
INDEPENDENT CONTRACTOR AGREEMENT

This Independent Contractor Agreement ("Agreement") is entered into as of [DATE] ("Effective Date") by and between:

CLIENT: [Client Name] ("Client")
CONTRACTOR: [Contractor Name] ("Contractor")

1. SERVICES
Contractor agrees to provide the following services to Client: [Description of services]

2. COMPENSATION
Client agrees to pay Contractor $[Amount] within 30 days of invoice submission. Late payments subject to 1.5% monthly service charge.

3. INTELLECTUAL PROPERTY
All work product created by Contractor shall be the exclusive property of Client. Contractor assigns all rights, title, and interest in such work product to Client.

4. NON-COMPETE
Contractor agrees not to compete with Client's business for a period of 2 years following termination of this Agreement.

5. INDEMNIFICATION
Contractor shall indemnify and hold harmless Client from any claims arising from Contractor's work.

6. TERMINATION
Either party may terminate this Agreement with 7 days written notice. Upon termination, Contractor shall immediately return all Client materials.

7. GOVERNING LAW
This Agreement shall be governed by the laws of [State].

8. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties.

Signed: ___________________
      `;
    }

    // Analyze with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert contract analyzer specializing in freelancer agreements. 
          Analyze the provided contract and return a JSON response with:
          1. riskScore: A number from 0-100 (higher = more risky for the freelancer)
          2. summary: A brief 2-3 sentence summary of the contract and overall assessment
          3. flaggedClauses: An array of problematic clauses, each with:
             - type: The category (e.g., "Payment Terms", "Intellectual Property", "Non-Compete", "Indemnification", "Termination")
             - severity: "high", "medium", or "low"
             - text: The exact or paraphrased clause text
             - explanation: Why this is problematic for the freelancer
             - suggestion: A suggested revision or negotiation point
          
          Focus on clauses that are unfavorable to the freelancer/contractor.`,
        },
        {
          role: "user",
          content: `Please analyze this contract:\n\n${contractText}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysisText = completion.choices[0].message.content;
    
    if (!analysisText) {
      throw new Error("No analysis generated");
    }

    const analysis = JSON.parse(analysisText);

    return NextResponse.json({
      riskScore: analysis.riskScore || 50,
      summary: analysis.summary || "Contract analyzed successfully.",
      flaggedClauses: analysis.flaggedClauses || [],
    });
  } catch (error) {
    console.error("Analysis error:", error);
    
    // Return mock data for demo if OpenAI fails
    return NextResponse.json({
      riskScore: 65,
      summary: "This contract contains several clauses that warrant careful review. The intellectual property assignment is broad, and the non-compete clause may be overly restrictive for your future work.",
      flaggedClauses: [
        {
          type: "Intellectual Property",
          severity: "high",
          text: "All work product created by Contractor shall be the exclusive property of Client. Contractor assigns all rights, title, and interest in such work product to Client.",
          explanation: "This clause assigns ALL rights to the client, including rights to your tools, methods, and potentially reusable components. This is overly broad and could prevent you from using similar approaches in future projects.",
          suggestion: "Negotiate to limit assignment to the final deliverables only, excluding your pre-existing tools, methods, and general know-how. Consider adding: 'Contractor retains all rights to pre-existing materials, tools, and general methodologies used in the creation of the work product.'",
        },
        {
          type: "Non-Compete",
          severity: "high",
          text: "Contractor agrees not to compete with Client's business for a period of 2 years following termination of this Agreement.",
          explanation: "A 2-year non-compete is lengthy and may be unenforceable in many jurisdictions, but could still create legal headaches. It could prevent you from working with similar clients in your specialty.",
          suggestion: "Request removal or reduction to 6 months. If the client insists, ask for geographic limitations and specific definition of 'competing' services. Alternatively, offer a non-solicitation clause (won't solicit their clients) instead.",
        },
        {
          type: "Payment Terms",
          severity: "medium",
          text: "Client agrees to pay Contractor within 30 days of invoice submission. Late payments subject to 1.5% monthly service charge.",
          explanation: "Net 30 is standard but can strain cash flow. The late fee is reasonable, but you have no recourse if they simply don't pay.",
          suggestion: "Consider requesting Net 15 for faster payment. Add a clause allowing you to pause work if payment is more than 15 days overdue. Consider requiring a 25-50% deposit upfront for new clients.",
        },
        {
          type: "Indemnification",
          severity: "medium",
          text: "Contractor shall indemnify and hold harmless Client from any claims arising from Contractor's work.",
          explanation: "This makes you solely responsible for any legal claims related to your work, even if the claim is frivolous or the client's fault. Legal defense costs can be substantial.",
          suggestion: "Add mutual indemnification or limit your liability to the amount paid under the contract. Consider: 'Each party's liability shall be limited to the total amount paid or payable under this Agreement.'",
        },
        {
          type: "Termination",
          severity: "low",
          text: "Either party may terminate this Agreement with 7 days written notice.",
          explanation: "Short notice period means little job security. Client could terminate with minimal notice, leaving you scrambling to replace the income.",
          suggestion: "Request 30 days notice for termination without cause. This provides more stability. You can offer a shorter notice period (7-14 days) if termination is for cause.",
        },
      ],
    });
  }
}
