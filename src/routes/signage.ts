import { Router } from "express";
import path from "path";

const router = Router();

router.get("/s/:streamKey", (req, res) => {
  // We gebruiken 1 signage.html voor alle streams; JS haalt streamKey uit URL
  res.sendFile(path.join(__dirname, "..", "views", "signage.html"));
});

export default router;
