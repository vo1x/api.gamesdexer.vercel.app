import { Router } from "express";
import searchController from "../controllers/steamRIP";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "API is up and running" });
});

router.get("/search", searchController.search);

export default router;
