import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚀 EstateOS API Server listening on port ${env.PORT}`);
  console.log(`👉 Health check: http://localhost:${env.PORT}/api/health`);
  console.log(`👉 Client origin: ${env.CLIENT_ORIGIN}`);
});
