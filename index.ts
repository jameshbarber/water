import { createApp } from "./src/index";
import manifest from "./src/config/manifest";

const {app} = createApp(manifest);

app.start();