export type RealWorksConfig = {
  baseUrl: string;
  afdeling: string;
  token: string;
};

function maskUrl(u: string) {
  return u.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
}

function authHeaders(token: string): Record<string, string> {
  // Meest voorkomende format in RealWorks docs: rwauth <token>
  return {
    Authorization: `rwauth ${token}`,
    Accept: "application/json",
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

/**
 * MVP:
 * We moeten 2 endpoints exact weten uit jouw RealWorks doc:
 * 1) List (actief aanbod -> object codes)
 * 2) Detail (1 object -> prijs/adres/media)
 *
 * Totdat jij die 2 urls/templates geeft, geven we expres een duidelijke error.
 */
export async function fetchActiveObjectCodes(cfg: RealWorksConfig): Promise<string[]> {
  console.log("[RW] baseUrl:", cfg.baseUrl, "afdeling:", cfg.afdeling);
  throw new Error(
    "RealWorks endpoints nog niet ingesteld. Stuur mij: (1) list endpoint voor actief aanbod en (2) detail endpoint template voor 1 object."
  );
}

export async function fetchObjectDetail(_cfg: RealWorksConfig, _objectCode: string): Promise<any> {
  throw new Error(
    "RealWorks endpoints nog niet ingesteld. Stuur mij: (1) list endpoint voor actief aanbod en (2) detail endpoint template voor 1 object."
  );
}
