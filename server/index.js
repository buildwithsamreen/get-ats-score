const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { rateLimit } = require("express-rate-limit");

dotenv.config({ quiet: true });

// Stateless API: resumes live in the user's browser, so there is no database.
const app = express();

// Hosts like Render/Railway sit behind a proxy; needed for per-visitor rate limits.
app.set("trust proxy", 1);
app.disable("x-powered-by");

// CLIENT_ORIGIN: comma-separated list of allowed sites. Blank = any (development only).
const allowed = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);
if (!allowed.length && process.env.NODE_ENV === "production") {
  console.warn("⚠ CLIENT_ORIGIN is not set: any website can call this API.");
}
app.use(cors({ origin: allowed.length ? allowed : true, exposedHeaders: ["X-Page-Count"] }));
app.use(express.json({ limit: "1mb" }));

const limitMessage = { message: "Too many requests. Please wait a minute and try again." };
// Uploads (scoring/importing files) are the expensive calls, so they get a tighter limit.
const uploadLimiter = rateLimit({ windowMs: 60 * 1000, limit: 15, standardHeaders: "draft-8", legacyHeaders: false, message: limitMessage });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: "draft-8", legacyHeaders: false, message: limitMessage });

app.get("/health", (req, res) => res.json({ ok: true }));
app.use(["/ats/score-file", "/ats/parse-file"], uploadLimiter);
app.use("/ats", apiLimiter, require("./routes/ats"));

// Errors such as oversized uploads
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ message: "File is too large (max 5 MB)" });
  console.error(err);
  return res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
