import { createApp } from "./src/index";
import manifest from "./src/config";

const {app} = createApp(manifest);

app.start();