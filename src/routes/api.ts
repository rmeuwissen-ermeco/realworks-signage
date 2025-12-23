import { Router } from "express";
import { demoItems, demoStreams } from "../data/demo";

const router = Router();

// Feed endpoint (no caching)
router.get("/api/streams/:streamKey/feed.json", (req, res) => {
  const { streamKey } = req.params;
  const stream = demoStreams[streamKey];
  if (!stream) return res.status(404).json({ error: "Unknown stream" });

  const items = demoItems[streamKey] || [];

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

export default router;
