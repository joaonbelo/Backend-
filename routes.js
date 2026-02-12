import express from "express";
import db from "./database.js";

const router = express.Router();

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
// CHECKOUT SIMPLES STRIPE
router.post("/create-checkout-session", async (req, res) => {
   router.post("/checkout-profissional", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 1499,
            recurring: { interval: "month" },
            product_data: {
              name: "KUT – Profissional",
            },
          },
          quantity: 1,
        },
      ],
      success_url: "https://kut.pt/sucesso",
      cancel_url: "https://kut.pt/cancelado",
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar sessão de checkout" });
  }
});

router.post("/checkout-empresa", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 14999,
            recurring: { interval: "year" },
            product_data: {
              name: "KUT – Empresa",
            },
          },
          quantity: 1,
        },
      ],
      success_url: "https://kut.pt/sucesso",
      cancel_url: "https://kut.pt/cancelado",
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar sessão de checkout" });
  }
}); 

try {
        const session = await req.app.locals.stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: "KUT – Subscrição",
                        },
                        unit_amount: 990, // 9,90€
                    },
                    quantity: 1,
                },
            ],
            success_url: "https://kutofficial-com-931962.hostingersite.com/sucesso.html",
            cancel_url: "https://kutofficial-com-931962.hostingersite.com/cancelado.html",
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
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