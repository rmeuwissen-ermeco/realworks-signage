export type RealWorksConfig = {
  baseUrl: string;   // bijv. https://api.realworks.nl
  afdeling: string;  // bijv. 935273
  token: string;     // zonder "rwauth "
};

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `rwauth ${token}`,
    Accept: "application/json;charset=UTF-8",
  };
}

export async function rwFetchJson<T>(url: string, token: string): Promise<T> {
  const r = await fetch(url, { headers: authHeaders(token) });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`RealWorks HTTP ${r.status} for ${url} :: ${txt.slice(0, 200)}`);
  }

  return (await r.json()) as T;
}

// --- Types (mini) voor wat we nodig hebben ---
type ListResponse = {
  resultaten?: Array<{
    diversen?: { diversen?: { objectcode?: string; afdelingscode?: string } };
    id?: number;
  }>;
  paginering?: { totaalAantal?: number };
};

export async function fetchActiveObjectCodes(cfg: RealWorksConfig): Promise<string[]> {
  const base = cfg.baseUrl.replace(/\/+$/, "");

  // paging via ?vanaf=ID (zoals in docs)
  const codes: string[] = [];
  let vanaf: number | undefined = undefined;

  // hard cap om runaway te voorkomen
  for (let page = 0; page < 20; page++) {
    const url =
      `${base}/wonen/v3/objecten?actief=true&aantal=100` +
      (vanaf ? `&vanaf=${encodeURIComponent(String(vanaf))}` : "");

    const data = await rwFetchJson<ListResponse>(url, cfg.token);

    const results = Array.isArray(data.resultaten) ? data.resultaten : [];
    if (results.length === 0) break;

    for (const r of results) {
      const code = r?.diversen?.diversen?.objectcode;
      if (code) codes.push(String(code));
    }

    // pagination: laatste id als volgende "vanaf"
    const last = results[results.length - 1];
    const lastId = typeof last?.id === "number" ? last.id : undefined;

    // als er geen id is, kunnen we niet verder pagineren -> stop
    if (!lastId) break;

    // prevent infinite loop
    if (vanaf === lastId) break;

    vanaf = lastId;
  }

  // unieke codes
  return Array.from(new Set(codes));
}

// Detail endpoint volgens webhook docs: /wonen/v3/objecten/{AFDELING}/{OBJECT}
export async function fetchObjectDetail(cfg: RealWorksConfig, objectCode: string): Promise<any> {
  const base = cfg.baseUrl.replace(/\/+$/, "");
  const url = `${base}/wonen/v3/objecten/${encodeURIComponent(cfg.afdeling)}/${encodeURIComponent(objectCode)}`;
  return await rwFetchJson<any>(url, cfg.token);
}
