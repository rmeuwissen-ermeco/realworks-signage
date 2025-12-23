"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const demo_1 = require("../data/demo");
const router = (0, express_1.Router)();
// Feed endpoint (no caching)
router.get("/api/streams/:streamKey/feed.json", (req, res) => {
    const { streamKey } = req.params;
    const stream = demo_1.demoStreams[streamKey];
    if (!stream)
        return res.status(404).json({ error: "Unknown stream" });
    const items = demo_1.demoItems[streamKey] || [];
    // No-store: signage moet altijd de meest recente feed kunnen ophalen
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.json({
        stream: {
            streamKey: stream.streamKey,
            title: stream.title,
            width: stream.width,
            height: stream.height,
            secondsPerItem: stream.secondsPerItem,
            theme: stream.theme,
            logoUrl: stream.logoUrl || null,
            generatedAtISO: new Date().toISOString()
        },
        items
    });
});
exports.default = router;
