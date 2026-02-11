import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Stripe from "stripe";
import db from "./database.js";
import routes from "./routes.js";

const app = express();
app.use(cors({
    origin: "https://kutofficial-com-931962.hostingersite.com"
}));
app.use(bodyParser.json());

// ENV VARS
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
app.locals.stripe = stripe;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ROTAS NORMAIS
app.use("/api", routes);

// WEBHOOK DO STRIPE
app.post("/webhook", bodyParser.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const email = event.data.object.customer_email;

    db.run(
      `UPDATE users SET plan_active = 1 WHERE email = ?`,
      [email],
      () => console.log("Plano ativado para:", email)
    );
  }

  res.json({ received: true });
});

// INICIAR SERVIDOR
app.listen(3000, () => {
  console.log("Backend KUT a correr na porta 3000");
});