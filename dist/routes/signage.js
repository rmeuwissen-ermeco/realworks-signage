"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
router.get("/s/:streamKey", (req, res) => {
    // We gebruiken 1 signage.html voor alle streams; JS haalt streamKey uit URL
    res.sendFile(path_1.default.join(__dirname, "..", "views", "signage.html"));
});
exports.default = router;
