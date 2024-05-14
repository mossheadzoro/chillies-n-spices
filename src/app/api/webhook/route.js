import {Order} from "@/models/Order";

const stripe = require('stripe')("sk_test_51PCFAYSH9crCnXmXafIZXNaJEI6wQHjCCwuHLYFdIujcuex9dQSLFHWRVC5OowBtWrt48CKEbY6CirKq7b4iEA3w002aXUoPq4");

export async function POST(req) {
  const sig = req.headers.get('stripe-signature');
  let event;

  try {
    const reqBuffer = await req.text();
    const signSecret = "whsec_5c7a903713803d62db24821ebee740882215af96102668d5b24ebeefa9080b85";
    event = stripe.webhooks.constructEvent(reqBuffer, sig, signSecret);
  } catch (e) {
    console.error('stripe error');
    console.log(e);
    return Response.json(e, {status: 400});
  }

  if (event.type === 'checkout.session.completed') {
    console.log(event);
    const orderId = event?.data?.object?.metadata?.orderId;
    const isPaid = event?.data?.object?.payment_status === 'paid';
    if (isPaid) {
      await Order.updateOne({_id:orderId}, {paid:true});
    }
  }

  return Response.json('ok', {status: 200});
}