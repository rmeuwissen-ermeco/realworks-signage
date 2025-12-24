export type RealWorksConfig = {
  baseUrl: string;   // https://api.realworks.nl
  afdeling: string;  // bv 935273
  token: string;     // token ZONDER "rwauth "
};

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `rwauth ${token}`,
    Accept: "application/json;charset=UTF-8",
  };
}

function cleanBaseUrl(u: string): string {
  return u.replace(/\/+$/, "");
}

export async function rwFetchJson<T>(url: string, token: string): Promise<T> {
  const r = await fetch(url, { headers: authHeaders(token) });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`RealWorks HTTP ${r.status} for ${url} :: ${txt.slice(0, 250)}`);
  }
  return (await r.json()) as T;
}

type ListResponse = {
  resultaten: Array<any>;
  paginering?: { totaalAantal?: number };
};

export async function fetchActiveObjectCodes(cfg: RealWorksConfig): Promise<string[]> {
  const base = cleanBaseUrl(cfg.baseUrl);

  // We vragen de v3 lijst op (actief aanbod).
  // RealWorks gebruikt pagination met ?vanaf=<id> (laatste id uit resultaten).
  const maxPages = 20;   // safety
  const perPage = 100;

  let vanaf: number | null = null;
  const codes: string[] = [];

  for (let page = 0; page < maxPages; page++) {
    const url =
      `${base}/wonen/v3/objecten?actief=true&aantal=${perPage}` +
      (vanaf ? `&vanaf=${encodeURIComponent(String(vanaf))}` : "");

    const data = await rwFetchJson<ListResponse>(url, cfg.token);

    const batch = (data.resultaten ?? [])
      .map((r) => String(r?.diversen?.diversen?.objectcode ?? "").trim())
      .filter(Boolean);

    codes.push(...batch);

    const results = data.resultaten ?? [];
    if (!results.length) break;

    // Pagination: "id" uit laatste resultaat
    const lastId = results[results.length - 1]?.id;
    if (typeof lastId !== "number") break;

    // Als er minder dan perPage terugkomt, zijn we klaar
    if (results.length < perPage) break;

    vanaf = lastId;
  }

  // Uniek maken
  return Array.from(new Set(codes));
}

export async function fetchObjectDetail(cfg: RealWorksConfig, objectCode: string): Promise<any> {
  const base = cleanBaseUrl(cfg.baseUrl);

  // v3 detail: /wonen/v3/objecten/{AFDELING}/{OBJECT}
  const url = `${base}/wonen/v3/objecten/${encodeURIComponent(cfg.afdeling)}/${encodeURIComponent(objectCode)}`;
  return rwFetchJson<any>(url, cfg.token);
}
