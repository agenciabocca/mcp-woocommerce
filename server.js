import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const { WOO_BASE_URL, WOO_CK, WOO_CS } = process.env;
if (!WOO_BASE_URL || !WOO_CK || !WOO_CS) {
  console.error("Faltam variáveis de ambiente!");
  process.exit(1);
}

const woo = axios.create({
  baseURL: WOO_BASE_URL,
  auth: { username: WOO_CK, password: WOO_CS },
  headers: { "Content-Type": "application/json" },
});

app.get("/", (_req, res) => res.json({ ok: true, msg: "MCP Woo Server ativo 🚀" }));

app.post("/mcp/tools", (_req, res) => {
  res.json({
    tools: [
      { name: "wc.listProducts", description: "Lista produtos do WooCommerce" },
      { name: "wc.getOrder", description: "Consulta um pedido por ID" },
      { name: "wc.createOrder", description: "Cria um pedido" },
      { name: "wc.updateOrder", description: "Atualiza um pedido existente" }
    ]
  });
});

app.post("/mcp/call", async (req, res) => {
  const { name, arguments: args } = req.body || {};
  try {
    let response;
    if (name === "wc.listProducts") {
      response = await woo.get("/products", { params: args });
    } else if (name === "wc.getOrder") {
      response = await woo.get(`/orders/${args.id}`);
    } else if (name === "wc.createOrder") {
      response = await woo.post("/orders", args.body);
    } else if (name === "wc.updateOrder") {
      response = await woo.put(`/orders/${args.id}`, args.body);
    } else {
      return res.status(400).json({ error: "Ferramenta desconhecida" });
    }
    res.json({ content: [{ type: "json", text: JSON.stringify(response.data) }] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log("✅ MCP Woo rodando na porta", PORT));
