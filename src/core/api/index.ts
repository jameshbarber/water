import { Logger } from "@/config";
import express, { Request, Response } from "express";

export const app = express();
const log = new Logger();

app.get("/", (req: Request, res: Response) => {
  log.info("Reading demo data...");
  log.info("Hello TypeScript + Express 👋");
  res.send("Hello TypeScript + Express 👋");
});

app.get("/read-demo-data", (req: Request, res: Response) => {
  log.info("Reading demo data...");
  const demoData = {
    id: "1",
    name: "John Doe"
  };
});

app.get("/delete-demo-data", (req: Request, res: Response) => {
  log.info("Deleting demo data...");
  const demoData = {
    id: "1",
    name: "John Doe"
  };
});
