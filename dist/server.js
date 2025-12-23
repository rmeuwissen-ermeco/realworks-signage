"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const admin_1 = __importDefault(require("./routes/admin"));
const signage_1 = __importDefault(require("./routes/signage"));
const api_1 = __importDefault(require("./routes/api"));
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 3000);
app.use(express_1.default.json({ limit: "2mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Static assets
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "..", "public"), {
    etag: true,
    maxAge: "1h"
}));
// Routes
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/", signage_1.default);
app.use("/", api_1.default);
app.use("/", admin_1.default);
// 404
app.use((_req, res) => {
    res.status(404).send("Not found");
});
app.listen(port, () => {
    console.log(`RealWorks Signage v0.1 running on http://localhost:${port}`);
});
