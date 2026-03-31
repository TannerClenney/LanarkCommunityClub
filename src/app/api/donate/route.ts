import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const formData = await req.formData();
  const amountRaw = formData.get("amount");
  const amount = parseInt(String(amountRaw));

  if (!amount || amount < 1 || amount > 99999) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amount * 100, // cents
          product_data: {
            name: "Donation to Lanark Community Club",
            description: "Thank you for supporting the Lanark Community Club!",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donate?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/donate`,
  });

  return NextResponse.redirect(session.url!, 303);
}
