// GET  /api/projects  -> public, returns the project list
// POST /api/projects  -> owner only (x-admin-password header), saves the list
const crypto = require("crypto");
const seed = require("../src/seed.json");

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "portfolio:projects";

async function redis(cmd) {
  const r = await fetch(KV_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const sha = (v) => crypto.createHash("sha256").update(String(v)).digest();
const str = (v, n) => String(v == null ? "" : v).slice(0, n);
const url = (v) => {
  const s = str(v, 600).trim();
  if (s && !/^https?:\/\//i.test(s)) throw new Error("Links must start with http:// or https://");
  return s;
};

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    try {
      if (KV_URL && KV_TOKEN) {
        const raw = await redis(["GET", KEY]);
        if (raw) return res.status(200).json(JSON.parse(raw));
      }
    } catch (e) {}
    return res.status(200).json(seed);
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const expected = process.env.ADMIN_PASSWORD;
  const given = req.headers["x-admin-password"] || "";
  const ok = expected && given && crypto.timingSafeEqual(sha(given), sha(expected));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 1000));
    return res.status(401).json({ error: "Wrong password" });
  }
  const body = req.body || {};
  if (body.verify) return res.status(200).json({ ok: true });

  if (!KV_URL || !KV_TOKEN)
    return res.status(500).json({ error: "Database not connected yet (see README step 4)" });
  const list = body.projects;
  if (!Array.isArray(list) || list.length > 100) return res.status(400).json({ error: "Invalid projects" });
  try {
    const clean = list.map((p, i) => ({
      id: str(p.id || "p" + Date.now() + i, 40),
      t: str(p.t, 120), g: str(p.g, 200), d: str(p.d, 4000),
      i: str(p.i || "✨", 8), y: str(p.y, 20),
      h: Math.abs(Number(p.h) || 250) % 360,
      l: url(p.l), img: url(p.img),
      tech: (Array.isArray(p.tech) ? p.tech : []).slice(0, 20).map((t) => str(t, 40)),
    }));
    await redis(["SET", KEY, JSON.stringify(clean)]);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message || "Save failed" });
  }
};
