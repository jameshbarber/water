import { DrizzleDataStore } from "@/adapters/database/drizzle";
import { deviceTableSchema } from "./schema";

const deviceDataStore = new DrizzleDataStore("devices", deviceTableSchema);

export default deviceDataStore;