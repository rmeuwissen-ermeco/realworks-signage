import { Request, Response, NextFunction } from "express";

function parseBasicAuthHeader(authHeader: string | undefined): { user: string; pass: string } | null {
  if (!authHeader) return null;
  const [scheme, encoded] = authHeader.split(" ");
  if (scheme !== "Basic" || !encoded) return null;

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx < 0) return null;
    return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
  } catch {
    return null;
  }
}

export function basicAuth(req: Request, res: Response, next: NextFunction) {
  const expectedUser = process.env.ADMIN_USER || "admin";
  const expectedPass = process.env.ADMIN_PASS || "changeme";

  const creds = parseBasicAuthHeader(req.header("authorization"));
  const ok = creds?.user === expectedUser && creds?.pass === expectedPass;

  if (!ok) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin"');
    return res.status(401).send("Authentication required.");
  }

  next();
}
