import express from "express";
import path from "path";

import adminRoutes from "./routes/admin";
import signageRoutes from "./routes/signage";
import apiRoutes from "./routes/api";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Static assets
app.use("/public", express.static(path.join(__dirname, "..", "public"), {
  etag: true,
  maxAge: "1h"
}));

// Routes
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/", signageRoutes);
app.use("/", apiRoutes);
app.use("/", adminRoutes);

// 404
app.use((_req, res) => {
  res.status(404).send("Not found");
});

app.listen(port, () => {
  console.log(`RealWorks Signage v0.1 running on http://localhost:${port}`);
});
