import fs from "fs";
import path from "path";

export const getSecurityLogs = (req, res) => {

  try {

    const logPath = path.resolve(
      "logs",
      "waf.log"
    );

    if (!fs.existsSync(logPath)) {
      return res.json([]);
    }

    const logs = fs.readFileSync(
      logPath,
      "utf-8"
    );

    const parsedLogs = logs
      .split("---")
      .map(log => log.trim())
      .filter(Boolean)
      .map(log => {

        try {
          return JSON.parse(log);
        } catch {
          return null;
        }

      })
      .filter(Boolean);

    res.json(parsedLogs.reverse());

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Failed to fetch logs"
    });
  }
};