import { createApp } from "./src/index";
import manifest from "./src/config";

createApp(manifest).then(({app}) => {
  app.start();
});