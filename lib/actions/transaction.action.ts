"use server";

import { redirect } from 'next/navigation'
import Stripe from "stripe";
import { handleError } from '../utils';
import { connectToDatabase } from '../database/mongoose';
import Transaction from '../database/models/transaction.model';
import { updateCredits } from './user.actions';
//function taht will process our payment
export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const amount = Number(transaction.amount) * 100;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name: transaction.plan,
          }
        },
        quantity: 1
      }
    ],
    metadata: {
      plan: transaction.plan,
      credits: transaction.credits,
      buyerId: transaction.buyerId,
    },
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
  })

  redirect(session.url!)
}


//create new transaction with buyer id passing all previous transaction in our database
export async function createTransaction(transaction: CreateTransactionParams) {
    try {
      await connectToDatabase();
  
      // Create a new transaction with a buyerId
      const newTransaction = await Transaction.create({
        ...transaction, buyer: transaction.buyerId
      })
  
      await updateCredits(transaction.buyerId, transaction.credits);
  
      return JSON.parse(JSON.stringify(newTransaction));
    } catch (error) {
      handleError(error)
    }
  }




//Session Creation: A Stripe Checkout session is created using stripe.checkout.sessions.create.
// Line Items:
// Price Data: Specifies the currency as USD and the unit amount as the converted amount in cents.
// Product Data: Provides the product name, taken from transaction.plan.
// Quantity: Set to 1, indicating a single unit of the product is being purchased.
// Metadata: Additional information about the transaction is added as metadata, which can be useful for later reference:
// Plan: The plan name.
// Credits: The number of credits involved in the transaction.
// BuyerId: The ID of the buyer.
// Mode: Set to 'payment', indicating a one-time payment.
// Success URL: The URL to which the user will be redirected upon successful payment. This is typically a profile or confirmation page.
// Cancel URL: The URL to which the user will be redirected if they cancel the payment. This is typically the home page or a specific cancellation page.


// Summary
// This function handles creating a payment session with Stripe for a transaction. It converts the transaction amount to the smallest currency unit (cents), sets up the line items and metadata, and redirects the user to the Stripe Checkout page. Upon successful payment, the user is redirected to a profile page, and if they cancel, they are redirected to the home page or another specified URL.
