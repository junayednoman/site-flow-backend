import Stripe from "stripe";
import config from "../../config";
import { Request, Response } from "express";
import SubscriptionPlan from "../subscriptionPlan/subscriptionPlan.model";
import Subscription from "../subscription/subscription.model";
import { ObjectId } from "mongoose";
import { generateTransactionId } from "../../utils/transactionIdGenerator";
import Auth from "../auth/auth.model";
import { TPayment } from "../payment/payment.interface";
import Payment from "../payment/payment.model";

// This is your test secret API key.
const stripe = new Stripe(config.stripe_secret_key!, {
  apiVersion: "2025-02-24.acacia",
});

const endpointSecret = config.stripe_webhook_secret_key;

const stripeWebhookHandler = async (request: Request, response: Response) => {
  let event = request.body;
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      console.log("Is Buffer?", Buffer.isBuffer(request.body)); // must be true
      console.log("Body type:", typeof request.body); // should be 'object' (Buffer is object)

      event = stripe.webhooks.constructEvent(
        request.body,
        signature!,
        endpointSecret
      );
    } catch (err: any) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      response.sendStatus(400);
      return
    }
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('checkout.session.completed event received');
      break;

    case 'invoice.payment_succeeded': {
      console.log('invoice.payment_succeeded event received');

      const invoice = event.data.object;
      if (invoice.amount_paid > 0) {
        try {
          const amountPaid = invoice.amount_paid / 100;
          const transaction_id = generateTransactionId()
          const user = await Auth.findOne({ email: invoice.customer_email });
          const paymentPayload: Partial<TPayment> = {
            user: user?._id as unknown as ObjectId,
            amount: amountPaid,
            transaction_id,
            status: "paid"
          }
          await Payment.create(paymentPayload);
        } catch (error: any) {
          console.log('error', error.message || "Something went wrong");
        }
      }
    }
      break;

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      if (invoice.billing_reason === 'subscription_cycle') {
        console.log('Auto-renewal failed');
      }
      break;
    }

    case 'invoice.created':
      console.log('Invoice created – send renewal reminder');
      break;

    case 'customer.subscription.updated': {
      const current = event.data.object;
      const previous = event.data.previous_attributes;

      const oldPriceId = previous?.items?.data?.[0]?.price?.id;
      const newPriceId = current.items.data[0].price.id;

      if (oldPriceId && oldPriceId !== newPriceId) {
        const newSubscriptionPlan = await SubscriptionPlan.findOne({ stripe_price_id: current.plan.id })
        if (newSubscriptionPlan) {
          const subscription = await Subscription.findOne({ stripe_subscription_id: current.id });
          if (subscription) {
            subscription.plan = newSubscriptionPlan._id;
            await subscription.save();
          }
        }
      }
      break;
    }

    case 'customer.subscription.deleted':
      console.log('Subscription canceled or expired');
      break;

    default:
      console.log(`Unhandled event type ${event.type}.`);
  }


  // Return a 200 response to acknowledge receipt of the event

  response.send();
  return
}

export default stripeWebhookHandler