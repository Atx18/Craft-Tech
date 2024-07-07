//we want to trigger a webhook from stripe  once a payemnet  is done so that we can call a createtransaction server action to create a trancsaction in database 
// we created a a endpoint at a stripe which will listen to events(Listening forcheckout.session.completed).one the checkout  is completed when a webhhok will be triggerd to craete the transaction in datbase 
/* eslint-disable camelcase */
import { createTransaction } from "@/lib/actions/transaction.action";
import { NextResponse } from "next/server";
import stripe from "stripe";


//we have are  having a post request and allowing it to be pinged by the webhook form stripe .once  pinged we access the body and process the signature to ensure that order is legit
//construct the event which ischeckout.session.completed 
// we destructure the id and form it which suits our
export async function POST(request: Request) {
  const body = await request.text();

  const sig = request.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json({ message: "Webhook error", error: err });
  }

  // Get the ID and type
  const eventType = event.type;

  // CREATE
  if (eventType === "checkout.session.completed") {
    const { id, amount_total, metadata } = event.data.object;

    const transaction = {
      stripeId: id,
      amount: amount_total ? amount_total / 100 : 0,
      plan: metadata?.plan || "",
      credits: Number(metadata?.credits) || 0,
      buyerId: metadata?.buyerId || "",
      createdAt: new Date(),
    };

    const newTransaction = await createTransaction(transaction);
    
    return NextResponse.json({ message: "OK", transaction: newTransaction });
  }

  return new Response("", { status: 200 });
}