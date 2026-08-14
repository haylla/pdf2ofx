import express from "express";
import cors from "cors";

import extratoRoutes from "./routes/extrato.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API PDF2OFX funcionando!");
});

app.use("/api/extrato", extratoRoutes);

export default app;