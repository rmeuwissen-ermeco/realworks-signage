import { Router } from "express";
import { prisma } from "../db/prisma";
import { fetchActiveObjectCodes, fetchObjectDetail, RealWorksConfig } from "../realworks/client";

const router = Router();

// Helpers
function esc(s: unknown): string {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 50);
}

function keyify(input: string): string {
  const base = slugify(input).slice(0, 40);
  return base || `stream-${Math.random().toString(36).slice(2, 8)}`;
}

function layout(title: string, body: string): string {
  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)} — RealWorks Signage</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">

  <style>
    :root{
      --bg:#0b1020;
      --card:#111831;
      --text:#e9edf7;
      --muted:#aab4d6;
      --primary:#1a73e8;
      --border:rgba(255,255,255,.08);
      --danger:#e53935;
      --ok:#34a853;
      --warn:#fbbc04;
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      font-family:Roboto,system-ui,-apple-system,Segoe UI,Arial,sans-serif;
      background:linear-gradient(180deg,#070b16 0%, #0b1020 60%, #070b16 100%);
      color:var(--text);
    }
    a{color:var(--primary); text-decoration:none}
    a:hover{text-decoration:underline}
    header{
      position:sticky; top:0;
      background:rgba(7,11,22,.85);
      backdrop-filter: blur(8px);
      border-bottom:1px solid var(--border);
      padding:14px 18px;
      display:flex; align-items:center; justify-content:space-between;
      z-index:10;
    }
    header .brand{display:flex; gap:10px; align-items:center; font-weight:700;}
    header .pill{
      font-size:12px; color:var(--muted);
      border:1px solid var(--border);
      padding:4px 10px; border-radius:999px;
    }
    main{max-width:1100px; margin:22px auto; padding:0 18px 40px;}
    h1{font-size:22px; margin:0 0 14px;}
    h2{font-size:16px; margin:0 0 10px; color:var(--muted); font-weight:500}
    .grid{display:grid; gap:14px}
    .grid.two{grid-template-columns: 1fr 1fr}
    @media (max-width: 980px){ .grid.two{grid-template-columns:1fr} }
    .card{
      background:rgba(17,24,49,.92);
      border:1px solid var(--border);
      border-radius:14px;
      padding:14px;
    }
    .row{display:flex; gap:12px; flex-wrap:wrap; align-items:center}
    .spacer{flex:1}
    .muted{color:var(--muted)}
    .table{width:100%; border-collapse:collapse}
    .table th, .table td{
      text-align:left;
      padding:10px 8px;
      border-bottom:1px solid var(--border);
      vertical-align:top;
      font-size:14px;
    }
    .table th{color:var(--muted); font-weight:500}
    .badge{
      display:inline-flex; align-items:center; gap:6px;
      border:1px solid var(--border);
      padding:4px 10px; border-radius:999px;
      font-size:12px; color:var(--muted);
    }
    .dot{width:8px; height:8px; border-radius:50%;}
    .dot.ok{background:var(--ok)}
    .dot.danger{background:var(--danger)}
    .dot.warn{background:var(--warn)}
    .btn{
      appearance:none; border:none;
      background:var(--primary);
      color:white; font-weight:600;
      padding:9px 12px; border-radius:10px;
      cursor:pointer; font-size:14px;
    }
    .btn:disabled{opacity:.6; cursor:not-allowed}
    .btn.secondary{background:transparent; border:1px solid var(--border); color:var(--text)}
    .btn.danger{background:var(--danger)}
    .btn.small{padding:7px 10px; font-size:13px; border-radius:10px}
    .field{display:flex; flex-direction:column; gap:6px; min-width:220px}
    .field label{font-size:12px; color:var(--muted)}
    input[type="text"], input[type="number"], input[type="color"], input[type="password"]{
      width:100%;
      padding:10px 10px;
      border-radius:10px;
      border:1px solid var(--border);
      background:rgba(0,0,0,.18);
      color:var(--text);
      outline:none;
    }
    input[type="color"]{padding:6px; height:42px}
    .hint{font-size:12px; color:var(--muted)}
    .footer-note{margin-top:10px; font-size:12px; color:var(--muted)}
    .kpi{display:flex; gap:12px; flex-wrap:wrap}
    .kpi .box{
      border:1px solid var(--border);
      border-radius:12px;
      padding:10px 12px;
      min-width:160px;
      background:rgba(0,0,0,.12);
    }
    .kpi .val{font-size:18px; font-weight:700}
    .kpi .lbl{font-size:12px; color:var(--muted)}
    .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;}
    .msg{
      border:1px solid var(--border);
      border-radius:12px;
      padding:10px 12px;
      background:rgba(0,0,0,.12);
      margin-bottom:12px;
    }
  </style>
</head>
<body>
<header>
  <div class="brand">
    <span>RealWorks Signage</span>
    <span class="pill">Admin</span>
  </div>
  <nav class="row">
    <a href="/admin/tenants" class="muted">Tenants</a>
    <span class="muted">|</span>
    <a href="/health" class="muted" target="_blank">Health</a>
  </nav>
</header>

<main>
  ${body}
</main>
</body>
</html>`;
}

function withMsg(url: string, msg: string) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}msg=${encodeURIComponent(msg)}`;
}

// Routes
router.get("/", (_req, res) => res.redirect("/admin/tenants"));

router.get("/tenants", async (_req, res) => {
  const [tenants, streamsCount] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: { streams: true },
    }),
    prisma.stream.count(),
  ]);

  const body = `
    <div class="row" style="margin-bottom:12px;">
      <div>
        <h1>Tenants</h1>
        <div class="muted">Beheer makelaars + streams. Jij-only (Basic Auth).</div>
      </div>
      <div class="spacer"></div>
      <div class="badge"><span class="dot ok"></span> DB connected</div>
    </div>

    <div class="kpi" style="margin-bottom:14px;">
      <div class="box"><div class="val">${tenants.length}</div><div class="lbl">Tenants</div></div>
      <div class="box"><div class="val">${streamsCount}</div><div class="lbl">Streams</div></div>
    </div>

    <div class="grid two">
      <div class="card">
        <h2>Nieuwe tenant</h2>
        <form method="post" action="/admin/tenants/create" class="grid" style="margin-top:10px;">
          <div class="field">
            <label>Naam</label>
            <input name="name" type="text" placeholder="Bijv. Makelaar Jansen" required />
          </div>
          <div class="field">
            <label>Slug (optioneel)</label>
            <input name="slug" type="text" placeholder="bijv. makelaar-jansen" />
            <div class="hint">Leeg = automatisch op basis van naam.</div>
          </div>
          <div class="row">
            <button class="btn" type="submit">Tenant aanmaken</button>
          </div>
        </form>
      </div>

      <div class="card">
        <h2>Bestaande tenants</h2>
        <table class="table" style="margin-top:6px;">
          <thead><tr>
            <th>Naam</th><th>Slug</th><th>Streams</th><th></th>
          </tr></thead>
          <tbody>
            ${
              tenants.length
                ? tenants
                    .map(
                      (t) => `<tr>
                        <td>${esc(t.name)}</td>
                        <td class="mono">${esc(t.slug)}</td>
                        <td>${t.streams.length}</td>
                        <td><a href="/admin/tenants/${esc(t.id)}">Open</a></td>
                      </tr>`
                    )
                    .join("")
                : `<tr><td colspan="4" class="muted">Nog geen tenants. Maak er één aan.</td></tr>`
            }
          </tbody>
        </table>
        <div class="footer-note">Tip: maak per makelaar meerdere streams voor verschillende schermen (etalage, wachtruimte, portrait).</div>
      </div>
    </div>
  `;

  res.send(layout("Tenants", body));
});

router.post("/tenants/create", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const slugInput = String(req.body?.slug ?? "").trim();

  if (!name) return res.status(400).send("Name is required");

  const slug = slugInput ? slugify(slugInput) : slugify(name);

  let finalSlug = slug;
  let n = 2;
  while (await prisma.tenant.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${n++}`;
  }

  const tenant = await prisma.tenant.create({
    data: { name, slug: finalSlug },
  });

  res.redirect(`/admin/tenants/${tenant.id}`);
});

router.get("/tenants/:tenantId", async (req, res) => {
  const tenantId = req.params.tenantId;
  const msg = String(req.query?.msg ?? "").trim();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { streams: { orderBy: { createdAt: "desc" } } },
  });

  if (!tenant) return res.status(404).send("Tenant not found");

  const rwEnabled = tenant.realworksEnabled ? "checked" : "";
  const rwStatus = tenant.realworksLastSyncStatus ? esc(tenant.realworksLastSyncStatus) : "—";
  const rwLast = tenant.realworksLastSyncAt ? new Date(tenant.realworksLastSyncAt).toISOString() : "—";

  const body = `
    ${msg ? `<div class="msg">${esc(msg)}</div>` : ""}

    <div class="row" style="margin-bottom:12px;">
      <div>
        <h1>${esc(tenant.name)}</h1>
        <div class="muted">Slug: <span class="mono">${esc(tenant.slug)}</span></div>
      </div>
      <div class="spacer"></div>
      <a class="btn secondary" href="/admin/tenants">Terug</a>
    </div>

    <div class="grid two">
      <div class="card">
        <h2>Branding</h2>
        <form method="post" action="/admin/tenants/${esc(tenant.id)}/update" class="grid" style="margin-top:10px;">
          <div class="row">
            <div class="field">
              <label>Primary</label>
              <input name="brandPrimary" type="color" value="${esc(tenant.brandPrimary)}" />
            </div>
            <div class="field">
              <label>Accent</label>
              <input name="brandAccent" type="color" value="${esc(tenant.brandAccent)}" />
            </div>
            <div class="field">
              <label>Background</label>
              <input name="brandBackground" type="color" value="${esc(tenant.brandBackground)}" />
            </div>
            <div class="field">
              <label>Text</label>
              <input name="brandText" type="color" value="${esc(tenant.brandText)}" />
            </div>
          </div>
          <div class="row">
            <button class="btn" type="submit">Opslaan</button>
          </div>
          <div class="hint">Logo upload doen we in v0.3 (met storage).</div>
        </form>
      </div>

      <div class="card">
        <h2>RealWorks koppeling (v0.2.2)</h2>
        <form method="post" action="/admin/tenants/${esc(tenant.id)}/realworks/update" class="grid" style="margin-top:10px;">
          <div class="field">
            <label>BASE_URL</label>
            <input name="realworksBaseUrl" type="text" placeholder="https://api.realworks.nl" value="${esc(tenant.realworksBaseUrl ?? "")}" />
            <div class="hint">Meestal: https://api.realworks.nl</div>
          </div>
          <div class="field">
            <label>AFDELING</label>
            <input name="realworksAfdeling" type="text" placeholder="bijv. 935273" value="${esc(tenant.realworksAfdeling ?? "")}" />
          </div>
          <div class="field">
            <label>TOKEN</label>
            <input name="realworksToken" type="password" placeholder="rwauth token (zonder 'rwauth ')" value="${esc(tenant.realworksToken ?? "")}" />
            <div class="hint">Let op: dit staat nu nog plain in DB. v0.3 encrypten.</div>
          </div>
          <div class="row">
            <label class="muted" style="display:flex;align-items:center;gap:8px;">
              <input type="checkbox" name="realworksEnabled" ${rwEnabled} />
              RealWorks actief
            </label>
            <div class="spacer"></div>
            <button class="btn" type="submit">Opslaan</button>
          </div>
          <div class="footer-note">
            Laatste sync: <span class="mono">${rwLast}</span> — status: <span class="mono">${rwStatus}</span>
          </div>
        </form>

        <form method="post" action="/admin/tenants/${esc(tenant.id)}/realworks/sync" style="margin-top:10px;">
          <button class="btn" type="submit">Sync nu (pull)</button>
          <div class="hint" style="margin-top:6px;">Haalt actieve objecten binnen en cached ze.</div>
        </form>
      </div>
    </div>

    <div class="card" style="margin-top:14px;">
      <h2>Nieuwe stream</h2>
      <form method="post" action="/admin/tenants/${esc(tenant.id)}/streams/create" class="grid" style="margin-top:10px;">
        <div class="field">
          <label>Titel</label>
          <input name="title" type="text" placeholder="Etalage — Actief aanbod" required />
        </div>
        <div class="field">
          <label>Stream key (optioneel)</label>
          <input name="streamKey" type="text" placeholder="etalage-1" />
          <div class="hint">Leeg = automatisch op basis van titel.</div>
        </div>
        <div class="row">
          <div class="field">
            <label>Breedte (px)</label>
            <input name="width" type="number" min="200" max="10000" value="1920" required />
          </div>
          <div class="field">
            <label>Hoogte (px)</label>
            <input name="height" type="number" min="200" max="10000" value="1080" required />
          </div>
          <div class="field">
            <label>Seconden per item</label>
            <input name="secondsPerItem" type="number" min="2" max="120" value="8" required />
          </div>
        </div>
        <div class="row">
          <button class="btn" type="submit">Stream aanmaken</button>
        </div>
      </form>
    </div>

    <div class="card" style="margin-top:14px;">
      <div class="row">
        <h2 style="margin:0;">Streams</h2>
        <div class="spacer"></div>
        <span class="muted">Tip: Publish als je content/filters wijzigt.</span>
      </div>

      <table class="table" style="margin-top:8px;">
        <thead>
          <tr>
            <th>Titel</th>
            <th>Key</th>
            <th>Resolutie</th>
            <th>Sec</th>
            <th>Version</th>
            <th>Links</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${
            tenant.streams.length
              ? tenant.streams
                  .map((s) => {
                    const preview = `/s/${esc(s.streamKey)}`;
                    const feed = `/api/streams/${esc(s.streamKey)}/feed.json`;
                    return `<tr>
                      <td>${esc(s.title)}</td>
                      <td class="mono">${esc(s.streamKey)}</td>
                      <td>${s.width}×${s.height}</td>
                      <td>${s.secondsPerItem}</td>
                      <td class="mono">v${s.publishedVersion}</td>
                      <td>
                        <a href="${preview}" target="_blank">Preview</a>
                        <span class="muted"> | </span>
                        <a href="${feed}" target="_blank">Feed</a>
                      </td>
                      <td class="row" style="justify-content:flex-end;">
                        <form method="post" action="/admin/streams/${esc(s.id)}/publish">
                          <button class="btn small" type="submit">Publish</button>
                        </form>
                      </td>
                    </tr>`;
                  })
                  .join("")
              : `<tr><td colspan="7" class="muted">Nog geen streams. Maak er boven één aan.</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;

  res.send(layout(`Tenant — ${tenant.name}`, body));
});

router.post("/tenants/:tenantId/update", async (req, res) => {
  const tenantId = req.params.tenantId;

  const brandPrimary = String(req.body?.brandPrimary ?? "").trim() || "#1a73e8";
  const brandAccent = String(req.body?.brandAccent ?? "").trim() || "#34a853";
  const brandBackground = String(req.body?.brandBackground ?? "").trim() || "#0b1020";
  const brandText = String(req.body?.brandText ?? "").trim() || "#ffffff";

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { brandPrimary, brandAccent, brandBackground, brandText },
  });

  res.redirect(`/admin/tenants/${tenantId}`);
});

router.post("/tenants/:tenantId/realworks/update", async (req, res) => {
  const tenantId = req.params.tenantId;

  const realworksBaseUrl = String(req.body?.realworksBaseUrl ?? "").trim() || null;
  const realworksAfdeling = String(req.body?.realworksAfdeling ?? "").trim() || null;
  const realworksToken = String(req.body?.realworksToken ?? "").trim() || null;
  const realworksEnabled = req.body?.realworksEnabled === "on";

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      realworksBaseUrl,
      realworksAfdeling,
      realworksToken,
      realworksEnabled,
    },
  });

  res.redirect(withMsg(`/admin/tenants/${tenantId}`, "RealWorks instellingen opgeslagen."));
});

router.post("/tenants/:tenantId/realworks/sync", async (req, res) => {
  const tenantId = req.params.tenantId;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return res.status(404).send("Tenant not found");

  if (!tenant.realworksEnabled) {
    return res.redirect(withMsg(`/admin/tenants/${tenantId}`, "RealWorks staat uit. Zet 'RealWorks actief' aan en sla op."));
  }
  if (!tenant.realworksBaseUrl || !tenant.realworksAfdeling || !tenant.realworksToken) {
    return res.redirect(withMsg(`/admin/tenants/${tenantId}`, "Vul BASE_URL, AFDELING en TOKEN in en sla op."));
  }

  const cfg: RealWorksConfig = {
    baseUrl: tenant.realworksBaseUrl,
    afdeling: tenant.realworksAfdeling,
    token: tenant.realworksToken,
  };

  try {
    const objectCodes = await fetchActiveObjectCodes(cfg);

    // detail ophalen en cache vullen (MVP)
    for (const code of objectCodes) {
      const detail = await fetchObjectDetail(cfg, code);

      // Mapping (MVP): pak wat veilige velden uit de v3 payload
      const status = String(detail?.financieel?.overdracht?.status ?? "ONBEKEND");
      const addressLine =
        [detail?.adres?.straat, detail?.adres?.huisnummer?.hoofdnummer, detail?.adres?.huisnummer?.toevoeging]
          .filter(Boolean)
          .join(" ") || "Onbekend adres";

      const city = String(detail?.adres?.plaats ?? "");
      const price = detail?.financieel?.overdracht?.koopprijs;
      const priceLine = Number.isFinite(price) ? `€ ${Number(price).toLocaleString("nl-NL")}` : "";

      const features: string[] = [];
      const woonopp = detail?.algemeen?.woonoppervlakte;
      if (Number.isFinite(woonopp)) features.push(`${woonopp} m²`);
      const kamers = detail?.algemeen?.aantalKamers;
      if (kamers) features.push(`${kamers} kamers`);
      const energielabel = detail?.algemeen?.energieklasse;
      if (energielabel) features.push(`Energielabel ${energielabel}`);

      const imageUrl =
        Array.isArray(detail?.media)
          ? (detail.media.find((m: any) => m?.vrijgave === true && m?.soort === "HOOFDFOTO")?.link ?? null)
          : null;

      const updatedAtISO = new Date().toISOString();

      await prisma.objectCache.upsert({
        where: { tenantId_objectCode: { tenantId, objectCode: code } },
        create: {
          tenantId,
          objectCode: code,
          afdelingCode: cfg.afdeling,
          status,
          addressLine,
          city,
          priceLine,
          features,
          imageUrl,
          updatedAtISO,
        },
        update: {
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

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        realworksLastSyncAt: new Date(),
        realworksLastSyncStatus: `OK: ${objectCodes.length} object(en) verwerkt`,
      },
    });

    return res.redirect(withMsg(`/admin/tenants/${tenantId}`, `Sync OK. ${objectCodes.length} object(en).`));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        realworksLastSyncAt: new Date(),
        realworksLastSyncStatus: `ERROR: ${msg.slice(0, 180)}`,
      },
    });

    return res.redirect(withMsg(`/admin/tenants/${tenantId}`, `Sync fout: ${msg}`));
  }
});

router.post("/tenants/:tenantId/streams/create", async (req, res) => {
  const tenantId = req.params.tenantId;

  const title = String(req.body?.title ?? "").trim();
  if (!title) return res.status(400).send("Title is required");

  const width = Number(req.body?.width ?? 1920);
  const height = Number(req.body?.height ?? 1080);
  const secondsPerItem = Number(req.body?.secondsPerItem ?? 8);

  const keyInput = String(req.body?.streamKey ?? "").trim();
  const baseKey = keyInput ? keyify(keyInput) : keyify(title);

  let streamKey = baseKey;
  let n = 2;
  while (await prisma.stream.findUnique({ where: { streamKey } })) {
    streamKey = `${baseKey}-${n++}`.slice(0, 40);
  }

  await prisma.stream.create({
    data: {
      tenantId,
      title,
      streamKey,
      width: Number.isFinite(width) ? width : 1920,
      height: Number.isFinite(height) ? height : 1080,
      secondsPerItem: Number.isFinite(secondsPerItem) ? secondsPerItem : 8,
      publishedVersion: 1,
    },
  });

  res.redirect(`/admin/tenants/${tenantId}`);
});

router.post("/streams/:streamId/publish", async (req, res) => {
  const streamId = req.params.streamId;

  const stream = await prisma.stream.update({
    where: { id: streamId },
    data: {
      publishedVersion: { increment: 1 },
      publishedAt: new Date(),
    },
    select: { tenantId: true },
  });

  res.redirect(`/admin/tenants/${stream.tenantId}`);
});

export default router;
