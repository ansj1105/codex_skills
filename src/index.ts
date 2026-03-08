import { createApp } from './app.js';
import { env } from './config/env.js';
import { createAppDependencies } from './container/create-app-dependencies.js';

const deps = createAppDependencies();
const app = createApp(deps);

if (env.walletMonitorEnabled) {
  deps.monitoringWorker.start();
}

app.listen(env.port, () => {
  console.log(`korion-kori-backend listening on port ${env.port}`);
});
