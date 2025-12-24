// 2) detail per object -> upsert in cache
for (const code of codes) {
  const detail = await fetchObjectDetail(cfg, code);

  // Mapping gebaseerd op jouw v3 payload
  const status =
    String(detail?.financieel?.overdracht?.status ?? detail?.financieel?.overdracht?.aanmeldingsreden ?? "ONBEKEND");

  const straat = String(detail?.adres?.straat ?? "").trim();
  const huisnr = String(detail?.adres?.huisnummer?.hoofdnummer ?? "").trim();
  const toevoeging = String(detail?.adres?.huisnummer?.toevoeging ?? "").trim();
  const addressLine = [straat, [huisnr, toevoeging].filter(Boolean).join("")].filter(Boolean).join(" ").trim();

  const city = String(detail?.adres?.plaats ?? "").trim();

  const koopprijs = detail?.financieel?.overdracht?.koopprijs;
  const prijsVoorvoegsel = String(detail?.financieel?.overdracht?.koopprijsvoorvoegsel ?? "").trim();
  const koopconditie = String(detail?.financieel?.overdracht?.koopconditie ?? "").trim();

  const priceLine =
    typeof koopprijs === "number"
      ? `${prijsVoorvoegsel ? prijsVoorvoegsel + " " : ""}€ ${koopprijs.toLocaleString("nl-NL")} ${koopconditie ? koopconditie : ""}`.trim()
      : "";

  const aantalKamers = String(detail?.algemeen?.aantalKamers ?? "").trim();
  const woonopp = detail?.algemeen?.woonoppervlakte;
  const energielabel = String(detail?.algemeen?.energieklasse ?? "").trim();
  const bouwjaar = String(detail?.algemeen?.bouwjaar ?? "").trim();

  const features: string[] = [];
  if (woonopp) features.push(`${woonopp} m²`);
  if (aantalKamers) features.push(`${aantalKamers} kamers`);
  if (energielabel) features.push(`Energielabel ${energielabel}`);
  if (bouwjaar) features.push(`Bouwjaar ${bouwjaar}`);

  // Hoofdfoto pakken (vrijgave=true en soort=HOOFDFOTO), anders eerste FOTO
  const media = Array.isArray(detail?.media) ? detail.media : [];
  const hoofd = media.find((m: any) => m?.vrijgave === true && m?.soort === "HOOFDFOTO");
  const foto = media.find((m: any) => m?.vrijgave === true && m?.mimetype?.startsWith("image/"));
  const imageUrl = String((hoofd?.link ?? foto?.link ?? "") || "").trim() || null;

  const updatedAtISO = String(detail?.tijdstipLaatsteWijziging ?? new Date().toISOString());

  const afdelingCode =
    String(detail?.diversen?.diversen?.afdelingscode ?? cfg.afdeling ?? "").trim() || null;

  await prisma.objectCache.upsert({
    where: { tenantId_objectCode: { tenantId: tenant.id, objectCode: code } },
    update: {
      afdelingCode,
      status,
      addressLine,
      city,
      priceLine,
      features,
      imageUrl,
      updatedAtISO,
    },
    create: {
      tenantId: tenant.id,
      objectCode: code,
      afdelingCode,
      status,
      addressLine,
      city,
      priceLine,
      features,
      imageUrl,
      updatedAtISO,
    },
  });
}
