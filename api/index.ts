import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());

registerRoutes(app);

export default app;
