import { Router } from "express";
import { basicAuth } from "../middleware/basicAuth";
import { demoStreams } from "../data/demo";

const router = Router();

function page(title: string, body: string) {
  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>

  <!-- Material-ish: fonts + icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;500;700" rel="stylesheet">

  <link rel="stylesheet" href="/public/admin.css" />
</head>
<body>
  <header class="topbar">
    <div class="topbar__inner">
      <div class="brand">
        <span class="material-symbols-outlined">tv</span>
        <span>RealWorks Signage</span>
      </div>
      <nav class="nav">
        <a href="/admin" class="nav__link">Dashboard</a>
      </nav>
    </div>
  </header>

  <main class="container">
    ${body}
  </main>
</body>
</html>`;
}

router.use("/admin", basicAuth);

// Admin dashboard
router.get("/admin", (_req, res) => {
  const streamList = Object.values(demoStreams).map(s => {
    return `
      <div class="card">
        <div class="card__header">
          <div>
            <div class="card__title">${s.tenantName}</div>
            <div class="card__subtitle">${s.title}</div>
          </div>
          <span class="chip">${s.width}×${s.height}</span>
        </div>
        <div class="card__content">
          <div class="kv">
            <div class="kv__k">Stream key</div><div class="kv__v mono">${s.streamKey}</div>
            <div class="kv__k">Seconds/item</div><div class="kv__v">${s.secondsPerItem}</div>
          </div>
        </div>
        <div class="card__actions">
          <a class="btn" href="/s/${s.streamKey}" target="_blank">
            <span class="material-symbols-outlined">preview</span> Preview
          </a>
          <a class="btn btn--ghost" href="/api/streams/${s.streamKey}/feed.json" target="_blank">
            <span class="material-symbols-outlined">data_object</span> Feed
          </a>
        </div>
      </div>
    `;
  }).join("");

  const body = `
    <div class="pagehead">
      <h1>Admin</h1>
      <p class="muted">Jij-only beheer (Basic Auth). v0.1 draait met demo-data.</p>
    </div>

    <div class="grid">
      ${streamList}
    </div>

    <div class="note">
      <div class="note__icon material-symbols-outlined">info</div>
      <div class="note__text">
        Volgende stap: tenants/streams opslaan in Postgres + een echte “Nieuwe klant / nieuwe stream” flow.
      </div>
    </div>
  `;

  res.send(page("Admin — RealWorks Signage", body));
});

export default router;
