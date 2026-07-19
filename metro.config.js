const { getDefaultConfig } = require("expo/metro-config");
const fs = require("fs");
const path = require("path");

const config = getDefaultConfig(__dirname);

// SVG Support
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...config.resolver.sourceExts, "svg"],
};

// Your local log server
config.server = {
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      if (
        req.url &&
        req.url.startsWith("/_local_logs") &&
        req.method === "POST"
      ) {
        console.log("[HomeOrbit Log Server] Receiving logs from device...");

        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const logsDir = path.join(__dirname, "logs");

            if (!fs.existsSync(logsDir)) {
              fs.mkdirSync(logsDir, { recursive: true });
            }

            const entries = JSON.parse(body);

            const formattedLogs =
              entries
                .map(
                  (e) =>
                    `[${e.timestamp}] [${e.level.toUpperCase()}] ${
                      e.event
                    }\nData: ${JSON.stringify(
                      e,
                      null,
                      2
                    )}\n----------------------------------------`
                )
                .join("\n") + "\n";

            fs.appendFileSync(
              path.join(logsDir, "app.log"),
              formattedLogs
            );

            res.writeHead(200, {
              "Content-Type": "application/json",
            });

            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            console.error("Failed to log to PC", e);
            res.writeHead(500);
            res.end("Error");
          }
        });

        return;
      }

      return middleware(req, res, next);
    };
  },
};

module.exports = config;
