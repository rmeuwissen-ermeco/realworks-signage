// src/realworks/client.ts

export type RealWorksConfig = {
  baseUrl: string;   // bijv. https://api.realworks.nl
  afdeling: string;  // bijv. 935273
  token: string;     // zonder 'rwauth ' prefix (wij plakken dat ervoor)
};

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `rwauth ${token}`,
    Accept: "application/json;charset=UTF-8",
  };
}

export async function rwFetchJson<T>(url: string, token: string): Promise<T> {
  const r: Response = await fetch(url, { headers: authHeaders(token) });

  if (!r.ok) {
    const txt: string = await r.text().catch((): string => "");
    throw new Error(`RealWorks HTTP ${r.status} for ${url} :: ${txt.slice(0, 200)}`);
  }

  const json: unknown = await r.json();
  return json as T;
}

// --- Types (minimaal wat we nodig hebben) ---
type WonenListItem = {
  id?: number;
  diversen?: {
    diversen?: {
      objectcode?: string;
      afdelingscode?: string;
    };
  };
};

type WonenListResponse = {
  resultaten?: WonenListItem[];
  paginering?: { totaalAantal?: number };
};

// --- Helpers ---
function joinUrl(baseUrl: string, path: string): string {
  const b: string = baseUrl.replace(/\/+$/, "");
  const p: string = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

function getObjectCode(it: WonenListItem): string | null {
  const code: string | undefined = it?.diversen?.diversen?.objectcode;
  return code ?? null;
}

function getLastId(items: WonenListItem[]): number | null {
  const last: WonenListItem | undefined = items[items.length - 1];
  const id: number | null = typeof last?.id === "number" ? last.id : null;
  return id;
}

/**
 * List endpoint:
 * GET {BASE_URL}/wonen/v3/objecten?actief=true&aantal=100(&vanaf=...)
 *
 * Retourneert objectcodes (string[]) zoals "EN104049"
 */
export async function fetchActiveObjectCodes(cfg: RealWorksConfig): Promise<string[]> {
  const baseListUrl: string = joinUrl(cfg.baseUrl, "/wonen/v3/objecten");
  const aantal: number = 100;

  const codes: string[] = [];
  let vanaf: number | null = null;

  // simpele safety cap zodat we niet oneindig loopen als API vreemd doet
  for (let page: number = 0; page < 50; page++) {
    const url: string =
      `${baseListUrl}?actief=true&aantal=${aantal}` + (vanaf ? `&vanaf=${vanaf}` : "");

    const data: WonenListResponse = await rwFetchJson<WonenListResponse>(url, cfg.token);

    const results: WonenListItem[] = Array.isArray(data.resultaten) ? data.resultaten : [];

    for (const r of results) {
      const code: string | null = getObjectCode(r);
      if (code) codes.push(code);
    }

    // klaar als minder dan 'aantal' terugkomt
    if (results.length < aantal) break;

    const lastId: number | null = getLastId(results);
    if (!lastId || lastId === vanaf) break; // extra veiligheid
    vanaf = lastId;
  }

  // dedupe (voor de zekerheid)
  return Array.from(new Set(codes));
}

/**
 * Detail endpoint (zoals webhook doc):
 * GET {BASE_URL}/wonen/v3/objecten/{AFDELING}/{OBJECT}
 */
export async function fetchObjectDetail(cfg: RealWorksConfig, objectCode: string): Promise<unknown> {
  const detailPath: string =
    `/wonen/v3/objecten/${encodeURIComponent(cfg.afdeling)}/${encodeURIComponent(objectCode)}`;
  const url: string = joinUrl(cfg.baseUrl, detailPath);

  const detail: unknown = await rwFetchJson<unknown>(url, cfg.token);
  return detail;
}
