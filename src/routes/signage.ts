import { Router } from "express";
import path from "path";
import fs from "fs";

const router = Router();

function resolveSignageHtml(): string {
  // In productie draait Node meestal vanuit de project-root op Render.
  // We proberen eerst dist/views (na build), daarna src/views (lokaal/dev).
  const candidates = [
    path.resolve(process.cwd(), "dist", "views", "signage.html"),
    path.resolve(process.cwd(), "src", "views", "signage.html"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  // Geef het "meest logische" pad terug voor debugging
  return candidates[0];
}

router.get("/s/:streamKey", (req, res) => {
  const streamKey = req.params.streamKey;
  const filePath = resolveSignageHtml();

  if (!fs.existsSync(filePath)) {
    return res.status(500).send(
      `signage.html not found for streamKey=${streamKey}\nTried: ${filePath}\nCWD=${process.cwd()}`
    );
  }

  res.sendFile(filePath);
});

export default router;
