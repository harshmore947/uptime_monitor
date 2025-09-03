import { Router } from "express";
import {
  getIncidentsByMonitor,
  createIncident,
  updateIncident,
  deleteIncident,
  getAllIncidents,
} from "../controllers/incident.contoller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/monitors/:id/incidents - List incidents for a monitor
router.get("/monitors/:id/incidents", authMiddleware, getIncidentsByMonitor);

// POST /api/monitors/:id/incidents - Create incident for a monitor
router.post("/monitors/:id/incidents", authMiddleware, createIncident);

// GET /api/incidents - List all incidents for user
router.get("/incidents", authMiddleware, getAllIncidents);

// PUT /api/incidents/:id - Update incident
router.put("/incidents/:id", authMiddleware, updateIncident);

// DELETE /api/incidents/:id - Delete incident
router.delete("/incidents/:id", authMiddleware, deleteIncident);

export default router;
