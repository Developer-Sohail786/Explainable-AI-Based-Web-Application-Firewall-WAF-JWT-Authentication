// Block 5:

import rateLimit from "express-rate-limit";


import path from "path";
import fs from "fs";

import { spawnSync } from "child_process";

function predictAttack(payload) {

  try {

    const result = spawnSync(
      "py",
      [
        "../ML/predict_explain.py",
        payload
      ],
      {
        encoding: "utf-8"
      }
    );
    console.log("STDOUT:", result.stdout);
    console.log("STDERR:", result.stderr);

    const output = result.stdout.trim();

    const [
      prediction,
      confidence,
      explanation
    ] = output.split("|");

    return {
      prediction,
      confidence: Number(confidence),
      explanation
    };

  } catch (error) {

    return {
      prediction: "error",
      confidence: 0
    };
  }
}


// create initial log entry so file always exists
try {
  fs.appendFileSync(
    path.join(process.cwd(), "logs", "waf.log"),
    `[${new Date().toISOString()}] WAF_STARTED\n`
  );
} catch (e) {
  console.error("Unable to write startup log:", e);
}

// BLOCK 1: IP BLOCKLIST
console.log("[waf.js] loaded — WAF middleware file loaded");

// logging helps
const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "waf.log");
fs.mkdirSync("logs", { recursive: true });

//

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR))
      fs.mkdirSync(LOG_DIR, {
        recursive: true,
      });
  } catch (error) {
    console.error("[WAF] ensureLogDir error", error);
  }
}

function writeLog(line) {
  try {
    ensureLogDir();
    const full = `[${new Date().toISOString()}] ${line}`;
    fs.appendFileSync(LOG_FILE, full + "\n");
  } catch (error) {
    console.error("[WAF] writelog error", error);
  }
}

// making logs prettier

function logEvent(eventObj) {
  try {
    ensureLogDir();
    eventObj.time = new Date().toISOString();
    const data = JSON.stringify(eventObj, null, 2);
    const entry = data + "\n---\n";
    fs.appendFileSync(LOG_FILE, entry, "utf-8");
  } catch (error) {
    console.error("[WAF] logEvent error", error);
  }
}

// Block 4: Malicious detection(SQL Injection,XSS,CSRF)

function normalize(s) {
  try {
    return String(s).toLowerCase();
  } catch {
    return "";
  }
}

// SQLi & XSS regex patterns

const SQLI_PATTERNS = [
  /union\s+select/i,
  /;\s*drop\s+table/i,
  /or\s+1\s*=\s*1/i,
  /(--|#).+$/i,
  /sleep\(\s*\d+\s*\)/i,
  /select\s+.*\s+from/i,
  /insert\s+into/i,
  /update\s+.*set/i,
];

const XSS_PATTERNS = [
  /<script\b/i,
  /<\/script>/i,
  /onerror\s*=/i,
  /javascript:/i,
  /<iframe\b/i,
  /<img\b.*onerror=/i,
];

function looksMalicious(body = {}, query = {}, headers = {}) {
  try {

    const combined = normalize(
      JSON.stringify({ body, query })
    )

    let riskScore = 0;

    let reasons = []

    let attackType = "Unknown"

    // SQL Injection Detection

    const sqlPatterns = [

      {
        regex: /union\s+select/i,
        score: 40,
        reason: "Detected UNION SELECT pattern"
      },

      {
        regex: /or\s+1\s*=\s*1/i,
        score: 35,
        reason: "Detected OR 1=1 SQL bypass"
      },

      {
        regex: /drop\s+table/i,
        score: 50,
        reason: "Detected DROP TABLE command"
      },

      {
        regex: /insert\s+into/i,
        score: 30,
        reason: "Detected INSERT INTO query"
      },

      {
        regex: /update\s+.*set/i,
        score: 30,
        reason: "Detected UPDATE SET query"
      }

    ];

    for (const item of sqlPatterns) {
      if (item.regex.test(combined)) {
        riskScore += item.score

        reasons.push(item.reason)

        attackType = "SQL Injection"
      }
    }

    // XSS Detection
    const xssPatterns = [

      {
        regex: /<script\b/i,
        score: 50,
        reason: "Detected script tag"
      },

      {
        regex: /javascript:/i,
        score: 40,
        reason: "Detected javascript payload"
      },

      {
        regex: /onerror\s*=/i,
        score: 35,
        reason: "Detected onerror event"
      },

      {
        regex: /<iframe\b/i,
        score: 30,
        reason: "Detected iframe injection"
      }

    ];

    for (const item of xssPatterns) {

      if (item.regex.test(combined)) {

        riskScore += item.score;

        reasons.push(item.reason);

        attackType = "XSS";
      }
    }

    // Path Traversal Detection

    const pathTraversalPatterns = [

      {
        regex: /(\.\.\/|%2E%2E|\\\.\.\\)/i,
        score: 45,
        reason: "Detected path traversal attempt"
      }

    ];

    for (const item of pathTraversalPatterns) {

      if (item.regex.test(combined)) {

        riskScore += item.score;

        reasons.push(item.reason);

        attackType = "Path Traversal";
      }
    }

    // Suspicious user-agent

    const userAgent = normalize(headers["user-agent"] || "")

    if (!userAgent || userAgent.length < 8) {
      riskScore += 20
      reasons.push("Suspicious user-agent detected")
    }

    // Severity classification

    let severity = "LOW"

    if (riskScore >= 70) {
      severity = "HIGH"
    } else if (riskScore >= 40) {
      severity = "MEDIUM"
    }
    return {
      malicious: riskScore > 0,
      riskScore,
      severity,
      attackType,
      reasons
    }
  } catch (error) {
    return {
      malicious: true,
      riskScore: 100,
      severity: "HIGH",
      attackType: "Unknown",
      reasons: ["Threat analysis engine failed"]
    }
  }
}

// CONFIG

const CONFIG = {
  staticBlockedIps: [], //permanant blocked Ip's
  requireClientIdHeader: false,
  requireJsonOnWrite: true,
  // rate limit settings(Block 5 cont....)
  rateLimit: {
    windowMs: 20 * 1000, //20secs
    max: 3, //max req per ip
    dynamicBlockMs: 60 * 1000, //adding to dynamic for 60s after rate limit hit or malicious payload(SQL injection etc)
  },
};

// Block 5 dynamic block list and rate limiter
// dynamic temporary block list
const dynamicBlocked = new Map();

// periodic clean up of expired dynamic blocks
setInterval(() => {
  const now = Date.now();
  for (const [ip, exp] of dynamicBlocked.entries()) {
    if (exp <= now) dynamicBlocked.delete(ip);
  }
}, 30 * 1000);

// ===== FIXED BLOCK 5: SAFE RATE LIMITER =====
const limiter = rateLimit({
  windowMs: CONFIG.rateLimit.windowMs,
  max: CONFIG.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    try {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const expiry =
        Date.now() + (CONFIG.rateLimit.dynamicBlockMs || 60 * 1000);
      dynamicBlocked.set(ip, expiry);

      // LOG: Rate Limit
      logEvent({
        type: "RATE_LIMIT",
        ip,
        path: req.path,
        method: req.method,
        expiresAt: new Date(expiry).toISOString(),
      });

      if (res.headersSent) return;

      return res.status(429).json({ ok: false, reason: "rate_limit" });
    } catch (e) {
      console.error("[WAF-Block5] limiter.handler error", e);
      writeLog(`RATE_LIMIT_HANDLER_ERROR - ${e?.message}`);
      if (!res.headersSent) {
        try {
          res.status(500).json({ ok: false, reason: "waf_error" });
        } catch (_) { }
      }
    }
  },
});

export function listDynamicBlocked() {
  const now = Date.now();
  const out = [];
  for (const [ip, exp] of dynamicBlocked.entries()) {
    if (exp > now) out.push({ ip, expiresAt: new Date(exp).toISOString() });
  }
  return out;
}

export function clearDynamicBlocked() {
  dynamicBlocked.clear();
  writeLog("ADMIN_CLEAR_DYNAMIC_BLOCKS");
  return true;
}

export function ipBlockWAF(req, res, next) {
  try {
    if (req.path.startsWith("/api/security")) {
      return next();
    }
    const blockedIps = new Set(CONFIG.staticBlockedIps || []);
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    console.log(`[WAF-Block1] Incoming  ${req.method}  ${req.path} from ${ip}`);

    // ===== BLOCK 5 (early) : dynamic temporary blocklist check =====
    const now = Date.now();
    // const expires = dynamicBlocked.get(ip);
    // if (expires && expires > now) {
    //   logEvent({
    //     type: "DYNAMIC_BLOCK_ENFORCE",
    //     ip,
    //     path: req.path,
    //     method: req.method,
    //     expiresAt: new Date(expires).toISOString(),
    //   });
    //   return res.status(403).json({ ok: false, reason: "ip_blocked" });
    // } else if (expires) {
    //   dynamicBlocked.delete(ip);
    // }

    // BLOCK 1: static blocklist
    if (blockedIps.has(ip)) {
      logEvent({
        type: "STATIC_BLOCK",
        ip,
        path: req.path,
        method: req.method,
      });
      return res.status(403).json({ ok: false, reason: "ip_blocked" });
    }

    // Block 2: required header check....
    const clientID = req.headers["x-client-id"];
    if (CONFIG.requireClientIdHeader && !clientID) {
      logEvent({
        type: "MISSING_CLIENT_ID",
        ip,
        path: req.path,
        method: req.method,
      });
      return res.status(400).json({ ok: false, reason: "missing_client_id" });
    }

    // Block 3: Content type enforcement for write req.....
    if (
      CONFIG.requireJsonOnWrite &&
      ["POST", "PUT", "PATCH"].includes(req.method)
    ) {
      const contentType = (req.headers["content-type"] || "")
        .split(";")[0]
        .trim();
      if (contentType !== "application/json") {
        logEvent({
          type: "BAD_CONTENT_TYPE",
          ip,
          path: req.path,
          method: req.method,
          contentType,
        });
        return res.status(415).json({ ok: false, reason: "bad_content_type" });
      }
    }

    // Block 4: Malicious Payload
    if (
      (req.body && Object.keys(req.body).length > 0) ||
      (req.query && Object.keys(req.query).length > 0)
    ) {

     const payload = [
  ...Object.values(req.body || {}),
  ...Object.values(req.query || {})
].join(" ");

      console.log("AI WAF CHECKING REQUEST...");
      console.log(payload);
      const aiResult = predictAttack(payload);
      console.log(aiResult);

      const attackType = aiResult.prediction;
      const confidence = aiResult.confidence;
      const explanation = aiResult.explanation;

      // Block only if confidence is high enough
      if (
        attackType !== "normal" &&
        confidence >= 0.70
      ) {

        dynamicBlocked.set(
          ip,
          Date.now() + (
            CONFIG.rateLimit.dynamicBlockMs || 60 * 1000
          )
        );

        logEvent({

          type: "AI_DETECTED_ATTACK",

          timestamp: new Date().toISOString(),

          ip,

          path: req.path,

          method: req.method,

          attackType,

          confidence,

          explanation,

          severity:
            confidence >= 0.95
              ? "HIGH"
              : confidence >= 0.80
                ? "MEDIUM"
                : "LOW",

          detectionEngine: "TF-IDF + Logistic Regression",

          payload: {

            body: req.body,

            query: req.query

          },

          userAgent: req.headers["user-agent"]

        });

        return res.status(403).json({

          ok: false,

          blocked: true,

          attackType,

          confidence,

          explanation,

          detectionEngine: "AI"

        });

      }
    }

    // ===== FIXED BLOCK 5: SAFE LIMITER CALL =====
    limiter(req, res, (err) => {
      if (res.headersSent) return;

      if (err) {
        writeLog(`RATE_LIMIT_ERROR - ${err?.message}`);
        if (!res.headersSent)
          return res.status(500).json({ ok: false, reason: "waf_error" });
        return;
      }

      req.waf = { checked: true, ip, clientID };
      next();
    });
  } catch (error) {
    console.error("[WAF-Block3] internal Error:", error);
    writeLog(`WAF_INTERNAL_ERROR - ${error?.message}`);
    if (!res.headersSent)
      res.status(500).json({ ok: false, reason: "waf_error" });
  }
}
