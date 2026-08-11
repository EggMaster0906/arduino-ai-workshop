import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = await buildApp({ config });

const closeServer = async () => {
  await app.close();
  process.exit(0);
};

process.once("SIGINT", () => void closeServer());
process.once("SIGTERM", () => void closeServer());

try {
  await app.listen({ port: config.port, host: "127.0.0.1" });
} catch {
  app.log.error("API 無法啟動");
  process.exit(1);
}
