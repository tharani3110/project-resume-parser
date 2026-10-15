import { Router } from "express";
import analyzeRoutes from "./analyzeRoutes.js";

// Mounting point for feature routers, so server.js stays short.
const router = Router();

router.use(analyzeRoutes);

export default router;
