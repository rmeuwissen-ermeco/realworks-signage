import { prisma } from "../src/db/prisma";

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-makelaar" },
    update: {},
    create: {
      name: "Demo Makelaar",
      slug: "demo-makelaar",
      brandPrimary: "#1a73e8",
      brandAccent: "#34a853",
      brandBackground: "#0b1020",
      brandText: "#ffffff",
    },
  });

  const stream = await prisma.stream.upsert({
    where: { streamKey: "demo" },
    update: {
      tenantId: tenant.id,
      title: "Etalage – Actueel aanbod",
      width: 1920,
      height: 1080,
      secondsPerItem: 8,
    },
    create: {
      tenantId: tenant.id,
      streamKey: "demo",
      title: "Etalage – Actueel aanbod",
      width: 1920,
      height: 1080,
      secondsPerItem: 8,
      publishedVersion: 1,
    },
  });

  const nowISO = new Date().toISOString();

  const items = [
    {
      objectCode: "RW-0001",
      status: "Actief",
      addressLine: "Dorpsstraat 12",
      city: "Sittard",
      priceLine: "€ 349.000 k.k.",
      features: ["118 m²", "4 kamers", "Energielabel B"],
      imageUrl:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
    },
    {
      objectCode: "RW-0002",
      status: "Onder bod",
      addressLine: "Parklaan 7",
      city: "Geleen",
      priceLine: "€ 289.000 k.k.",
      features: ["96 m²", "3 kamers", "Energielabel C"],
      imageUrl:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
    },
    {
      objectCode: "RW-0003",
      status: "Verkocht",
      addressLine: "Heuvelweg 3",
      city: "Born",
      priceLine: "€ 415.000 v.o.n.",
      features: ["142 m²", "5 kamers", "Energielabel A"],
      imageUrl:
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  for (const it of items) {
    await prisma.objectCache.upsert({
      where: {
        tenantId_objectCode: {
          tenantId: tenant.id,
          objectCode: it.objectCode,
        },
      },
      update: {
        status: it.status,
        addressLine: it.addressLine,
        city: it.city,
        priceLine: it.priceLine,
        features: it.features,
        imageUrl: it.imageUrl,
        updatedAtISO: nowISO,
      },
      create: {
        tenantId: tenant.id,
        objectCode: it.objectCode,
        status: it.status,
        addressLine: it.addressLine,
        city: it.city,
        priceLine: it.priceLine,
        features: it.features,
        imageUrl: it.imageUrl,
        updatedAtISO: nowISO,
      },
    });
  }

  // bump publish version zodat displays refreshen
  await prisma.stream.update({
    where: { id: stream.id },
    data: {
      publishedVersion: { increment: 1 },
      publishedAt: new Date(),
    },
  });

  console.log("Seed done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
