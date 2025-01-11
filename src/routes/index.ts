import { Router } from "express";
import searchController from "../controllers/searchController";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "API is up and running" });
});

router.get("/search", searchController.search);

export default router;
