import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email || session.metadata?.email;
    const customerId = session.customer;

    if (email && customerId) {
      try {
        await setDoc(doc(db, "users", customerId as string), {
          email,
          stripeCustomerId: customerId,
          subscriptionStatus: "active",
          plan: "starter",
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Failed to write user to Firestore:", err);
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    try {
      await setDoc(
        doc(db, "users", subscription.customer as string),
        { subscriptionStatus: "canceled" },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to update subscription status:", err);
    }
  }

  return NextResponse.json({ received: true });
}
