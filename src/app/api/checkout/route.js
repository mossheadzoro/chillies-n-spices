import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import {MenuItem} from "@/models/MenuItem";
import {Order} from "@/models/Order";
import mongoose from "mongoose";
import {getServerSession} from "next-auth";
const stripe = require('stripe')("sk_test_51PCFAYSH9crCnXmXafIZXNaJEI6wQHjCCwuHLYFdIujcuex9dQSLFHWRVC5OowBtWrt48CKEbY6CirKq7b4iEA3w002aXUoPq4");

export async function POST(req) {
  mongoose.connect("mongodb+srv://food-ordering:ldpQQODlMZo24b8I@cluster0.tjhvwss.mongodb.net/food-ordering");

  const {cartProducts, address} = await req.json();
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  const orderDoc = await Order.create({
    userEmail,
    ...address,
    cartProducts,
    paid: false,
  });

  const stripeLineItems = [];
  for (const cartProduct of cartProducts) {

    const productInfo = await MenuItem.findById(cartProduct._id);

    let productPrice = productInfo.basePrice;
    if (cartProduct.size) {
      const size = productInfo.sizes
        .find(size => size._id.toString() === cartProduct.size._id.toString());
      productPrice += size.price;
    }
    if (cartProduct.extras?.length > 0) {
      for (const cartProductExtraThing of cartProduct.extras) {
        const productExtras = productInfo.extraIngredientPrices;
        const extraThingInfo = productExtras
          .find(extra => extra._id.toString() === cartProductExtraThing._id.toString());
        productPrice += extraThingInfo.price;
      }
    }

    const productName = cartProduct.name;

    stripeLineItems.push({
      quantity: 1,
      price_data: {
        currency: 'INR',
        product_data: {
          name: productName,
        },
        unit_amount: productPrice * 100,
      },
    });
  }

  const stripeSession = await stripe.checkout.sessions.create({
    line_items: stripeLineItems,
    mode: 'payment',
    customer_email: userEmail,
    success_url: "http://localhost:3000/" + 'orders/' + orderDoc._id.toString() + '?clear-cart=1',
    cancel_url: "http://localhost:3000/" + 'cart?canceled=1',
    metadata: {orderId:orderDoc._id.toString()},
    payment_intent_data: {
      metadata:{orderId:orderDoc._id.toString()},
    },
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: 'Delivery fee',
          type: 'fixed_amount',
          fixed_amount: {amount: 500, currency: 'INR'},
        },
      }
    ],
  });

  return Response.json(stripeSession.url);
}