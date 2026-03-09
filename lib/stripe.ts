import Stripe from "stripe";
import { Plan } from "@/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    reviewsPerMonth: 5,
    priceId: "",
    features: [
      "5 reviews per month",
      "URL & code review",
      "Basic feedback",
      "7-day history",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    interval: "month",
    reviewsPerMonth: 100,
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
    features: [
      "100 reviews per month",
      "URL & code review",
      "Detailed AI feedback",
      "Unlimited history",
      "Priority support",
      "Export reports (PDF)",
    ],
  },
];

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  email: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId },
  });

  return session;
}

export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return session;
}
