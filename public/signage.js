function getStreamKeyFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  // /s/:streamKey
  return parts[1] || "demo";
}

function statusToBadgeStyle(status) {
  // subtiel: we doen kleur via CSS vars
  if (status === "Actief") return { bg: "rgba(52,168,83,0.20)", border: "rgba(52,168,83,0.35)" };
  if (status === "Onder bod") return { bg: "rgba(251,188,5,0.20)", border: "rgba(251,188,5,0.35)" };
  return { bg: "rgba(234,67,53,0.20)", border: "rgba(234,67,53,0.35)" };
}

async function fetchFeed(streamKey, versionBuster) {
  const url = `/api/streams/${encodeURIComponent(streamKey)}/feed.json?v=${encodeURIComponent(versionBuster)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Feed fetch failed (${res.status})`);
  return res.json();
}

function applyTheme(theme) {
  if (!theme) return;
  document.documentElement.style.setProperty("--bg", theme.background || "#0b1020");
  document.documentElement.style.setProperty("--text", theme.text || "#ffffff");
  document.documentElement.style.setProperty("--primary", theme.primary || "#1a73e8");
  document.documentElement.style.setProperty("--accent", theme.accent || "#34a853");
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "—";
}

function setFeatures(features) {
  const wrap = document.getElementById("features");
  if (!wrap) return;
  wrap.innerHTML = "";
  (features || []).forEach(f => {
    const chip = document.createElement("div");
    chip.className = "feature";
    chip.textContent = f;
    wrap.appendChild(chip);
  });
}

function setImage(url) {
  const img = document.getElementById("heroImg");
  if (!img) return;

  if (!url) {
    img.classList.remove("is-visible");
    img.removeAttribute("src");
    return;
  }

  const preload = new Image();
  preload.onload = () => {
    img.src = url;
    img.classList.add("is-visible");
  };
  preload.onerror = () => {
    img.classList.remove("is-visible");
    img.removeAttribute("src");
  };
  preload.src = url;
}

function setLogo(logoUrl) {
  const logo = document.getElementById("logo");
  if (!logo) return;

  if (!logoUrl) {
    logo.classList.remove("is-visible");
    logo.removeAttribute("src");
    return;
  }
  logo.src = logoUrl;
  logo.classList.add("is-visible");
}

function setBadge(status) {
  const badge = document.getElementById("statusBadge");
  if (!badge) return;
  badge.textContent = status || "—";

  const s = statusToBadgeStyle(status);
  badge.style.background = s.bg;
  badge.style.borderColor = s.border;
}

function formatUpdated(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("nl-NL", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "—";
  }
}

async function run() {
  const streamKey = getStreamKeyFromPath();

  let feed;
  try {
    // versionBuster: timestamp is voldoende voor demo; later gebruiken we published_version
    feed = await fetchFeed(streamKey, Date.now());
  } catch (e) {
    setText("hint", "Geen feed beschikbaar.");
    return;
  }

  const stream = feed.stream;
  const items = feed.items || [];

  applyTheme(stream.theme);
  setText("streamTitle", stream.title || stream.streamKey);
  setLogo(stream.logoUrl);

  if (!items.length) {
    setText("address", "Geen actueel aanbod");
    setText("city", "");
    setText("price", "");
    setFeatures([]);
    setBadge("—");
    setText("updatedAt", `Laatste update: ${formatUpdated(stream.generatedAtISO)}`);
    setText("hint", "");
    setImage(null);
    return;
  }

  let idx = 0;
  const seconds = Math.max(3, Number(stream.secondsPerItem || 8));
  const tickMs = seconds * 1000;

  function show(i) {
    const it = items[i];
    setBadge(it.status);
    setText("address", it.addressLine);
    setText("city", it.city);
    setText("price", it.priceLine);
    setFeatures(it.features);
    setText("updatedAt", `Laatste update: ${formatUpdated(it.updatedAtISO || stream.generatedAtISO)}`);
    setText("hint", "");
    setImage(it.imageUrl);
  }

  show(idx);

  setInterval(async () => {
    // eenvoudige refresh: elke 4 ticks herladen om updates te pakken
    // later: published_version + slimme polling
    idx = (idx + 1) % items.length;
    show(idx);
  }, tickMs);
}

run().catch(() => {});
