import { Router } from "express";
import { prisma } from "../db/prisma";

const router = Router();

type FeedItem = {
  objectCode: string;
  status: string;
  addressLine: string;
  city: string;
  priceLine: string;
  features: string[];
  imageUrl: string | null;
  updatedAtISO: string | null;
};

router.get("/api/streams/:streamKey/feed.json", async (req, res) => {
  const { streamKey } = req.params;

  const stream = await prisma.stream.findUnique({
    where: { streamKey },
    include: { tenant: true },
  });

  if (!stream) return res.status(404).json({ error: "Unknown stream" });

  const items = await prisma.objectCache.findMany({
    where: { tenantId: stream.tenantId },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  const mapped: FeedItem[] = items.map((it): FeedItem => ({
    objectCode: it.objectCode,
    status: it.status,
    addressLine: it.addressLine,
    city: it.city,
    priceLine: it.priceLine,
    features: it.features,
    imageUrl: it.imageUrl,
    updatedAtISO: it.updatedAtISO,
  }));

  res.json({
    stream: {
      streamKey: stream.streamKey,
      title: stream.title,
      width: stream.width,
      height: stream.height,
      secondsPerItem: stream.secondsPerItem,
      publishedVersion: stream.publishedVersion,
      generatedAtISO: new Date().toISOString(),
      theme: {
        primary: stream.tenant.brandPrimary,
        accent: stream.tenant.brandAccent,
        background: stream.tenant.brandBackground,
        text: stream.tenant.brandText,
      },
      logoUrl: null
    },
    items: mapped.map((it) => ({
      id: it.objectCode,
      status: it.status,
      addressLine: it.addressLine,
      city: it.city,
      priceLine: it.priceLine,
      features: it.features,
      imageUrl: it.imageUrl,
      updatedAtISO: it.updatedAtISO,
    })),
  });
});

export default router;
