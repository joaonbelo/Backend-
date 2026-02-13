import express from "express";
import db from "./database.js";

const router = express.Router();

// TESTE
router.get("/test", (req, res) => {
  res.json({ message: "Backend está a funcionar!" });
});

// REGISTO
router.post("/register", (req, res) => {
  const { email, password, barbershop_name } = req.body;

  db.run(
    `INSERT INTO users (email, password, barbershop_name) VALUES (?, ?, ?)`,
    [email, password, barbershop_name],
    function (err) {
      if (err) return res.status(400).json({ error: "Email já existe" });
      res.json({ success: true, userId: this.lastID });
    }
  );
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE email = ? AND password = ?`,
    [email, password],
    (err, user) => {
      if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
      res.json({
        success: true,
        userId: user.id,
        barbershop_name: user.barbershop_name,
        plan_active: user.plan_active
      });
    }
  );
});

// CHECKOUT PROFISSIONAL
router.post("/checkout-profissional", async (req, res) => {
  try {
    const stripe = req.app.locals.stripe;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 1499,
            recurring: { interval: "month" },
            product_data: { name: "KUT – Profissional" }
          },
          quantity: 1
        }
      ],
      success_url: "https://kut.pt/sucesso",
      cancel_url: "https://kut.pt/cancelado"
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar sessão de checkout" });
  }
});

// CHECKOUT EMPRESA
router.post("/checkout-empresa", async (req, res) => {
  try {
    const stripe = req.app.locals.stripe;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 14999,
            recurring: { interval: "year" },
            product_data: { name: "KUT – Empresa" }
          },
          quantity: 1
        }
      ],
      success_url: "https://kut.pt/sucesso",
      cancel_url: "https://kut.pt/cancelado"
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar sessão de checkout" });
  }
});

// ESTADO DO PLANO
router.get("/plan/:userId", (req, res) => {
  const { userId } = req.params;

  db.get(`SELECT plan_active FROM users WHERE id = ?`, [userId], (err, row) => {
    if (!row) return res.status(404).json({ error: "Utilizador não encontrado" });
    res.json({ plan_active: row.plan_active });
  });
});

export default router;