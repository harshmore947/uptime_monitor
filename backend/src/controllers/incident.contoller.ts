import { Request, Response } from "express";
import { Monitor } from "../model/monitor-model";
import { Incident } from "../model/incident-model";

export const getIncidentsByMonitor = async (req: Request, res: Response) => {
  try {
    const monitorId = req.params.id;
    const userId = req.user;
    const { page = 1, limit = 10, status } = req.query;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    // Ensure user owns the monitor
    const monitor = await Monitor.findOne({ _id: monitorId, userId });
    if (!monitor) {
      return res
        .status(404)
        .json({ msg: "Monitor not found or access denied", success: false });
    }

    // Convert to numbers for pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    // Fetch incidents with pagination and optional status filter
    const query: any = { monitorId };
    if (status) query.status = status;

    const incidents = await Incident.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Incident.countDocuments(query);

    res.status(200).json({
      msg: "Incidents fetched successfully",
      success: true,
      incidents,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const createIncident = async (req: Request, res: Response) => {
  try {
    const monitorId = req.params.id;
    const userId = req.user;
    const {
      title,
      description,
      status = "open",
      startTime,
      endTime,
    } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    //Ensure user owns the monitor
    const monitor = await Monitor.findOne({ _id: monitorId, userId });
    if (!monitor) {
      return res
        .status(404)
        .json({ msg: "Monitor not found or accsssibel", success: false });
    }

    //Create Incident
    const incident = new Incident({
      monitorId,
      title,
      description,
      status,
      startTime: startTime || new Date(),
      endTime,
    });

    await incident.save();

    res
      .status(201)
      .json({ msg: "Incident created successfully", success: true, incident });
  } catch (error) {
    console.error("Error creating incidient", error);
    res.status(500).json({ msg: "Internal server Error", success: false });
  }
};

export const updateIncident = async (req: Request, res: Response) => {
  try {
    const incidentId = req.params.id;
    const userId = req.user;
    const updates = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    //Find incident and ensure ownership via monitor
    const incident = await Incident.findById(incidentId).populate("monitorId");
    if (!incident || (incident.monitorId as any).userId.toString() !== userId) {
      return res.status(404).json({ msg: "Incident not found or accesible" });
    }

    //update incident
    Object.assign(incident, updates);
    await incident.save();

    res
      .status(200)
      .json({ msg: "Incident update successfully", success: true, incident });
  } catch (error) {
    console.error("Error updating incident:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const deleteIncident = async (req: Request, res: Response) => {
  try {
    const incidentId = req.params.id;
    const userId = req.user;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authencticted", success: false });
    }

    //Find incident and ensure owernship via monitor
    const incident = await Incident.findById(incidentId).populate("monitorId");
    if (!incident || (incident.monitorId as any).userId.toString() !== userId) {
      return res
        .status(404)
        .json({ msg: "Incident not found or access denied", success: false });
    }

    //Delete incident
    await Incident.deleteOne({ _id: incidentId });

    res
      .status(200)
      .json({ msg: "incident deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting incident", error);
    res.status(500).json({ msg: "Interval server error", success: false });
  }
};

export const getAllIncidents = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    const { page = 1, limit = 10, status } = req.query;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    // Convert to numbers for pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    // Fetch incidents for user's monitors
    const monitors = await Monitor.find({ userId }).select("_id");
    const monitorIds = monitors.map((m) => m._id);

    const query: any = { monitorId: { $in: monitorIds } };
    if (status) query.status = status;

    const incidents = await Incident.find(query)
      .populate("monitorId", "name url")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Incident.countDocuments(query);

    res.status(200).json({
      msg: "Incidents fetched successfully",
      success: true,
      incidents,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const addIncidentUpdate = async (req: Request, res: Response) => {
  try {
    const incidentId = req.params.id;
    const userId = req.user;
    const { status, message } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    // Find incident and ensure ownership via monitor
    const incident = await Incident.findById(incidentId).populate("monitorId");
    if (!incident || (incident.monitorId as any).userId.toString() !== userId) {
      return res
        .status(404)
        .json({ msg: "Incident not found or access denied", success: false });
    }

    // Add update to incident
    const update = {
      status: status || incident.status,
      message,
      updatedAt: new Date(),
    };

    incident.updates.push(update);

    // Update incident status if provided
    if (status) {
      incident.status = status;
      if (status === "resolved") {
        incident.resolvedAt = new Date();
      }
    }

    await incident.save();

    res.status(200).json({
      msg: "Incident update added successfully",
      success: true,
      incident,
    });
  } catch (error) {
    console.error("Error adding incident update:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};
