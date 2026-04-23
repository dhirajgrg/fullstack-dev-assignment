import { Router } from "express";
import { createSecret, getSecret } from "../controllers/secret.controller.js";

const router = Router();

router.post("/", createSecret);
router.post("/:token", getSecret);

export default router;
