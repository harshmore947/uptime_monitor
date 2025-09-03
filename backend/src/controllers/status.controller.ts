import { Request, Response } from "express";
import { StatusPage } from "../model/statuspage-model";
import { success } from "zod";
import { Monitor } from "../model/monitor-model";

export const getUserStatusPage = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    const { page = 1, limit = 10 } = req.query;
    if (!userId) {
      return res
        .status(401)
        .json({ msg: "user not authenticated", success: false });
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const statusPage = await StatusPage.find({ userId })
      .populate("monitors", "name url status")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await StatusPage.countDocuments({ userId });

    res
      .status(200)
      .json({
        msg: "Status page fetched successfully",
        success: true,
        statusPage,
        pagination: { page: pageNum, limit: limitNum, total },
      });
  } catch (error) {
    console.log("Error fetching status page", error);
    res.status(500).json({ msg: "Internal server Error", success: false });
  }
};

export const createStatusPage = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    const { name, slug, description, monitors, isPublic = true } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    //check if slug is unqiue
    const existingUrl = await StatusPage.findOne({ slug });
    if (existingUrl) {
      return res.status(400).json({ msg: "Slug already exist", success });
    }

    //validate monitor belong to user
    if (monitors && monitors.length > 0) {
      const userMonitors = await Monitor.find({
        userId,
        _id: { $in: monitors },
      });
      if (userMonitors.length !== monitors.length) {
        return res
          .status(400)
          .json({ msg: "Invalid monitors", success: false });
      }
    }

    const statusPage = new StatusPage({
      userId,
      name,
      slug,
      description,
      monitors: monitors || [],
      isPublic,
    });

    await statusPage.save();

    res.status(201).json({
      msg: "Status page created successfully",
      success: true,
      statusPage,
    });
  } catch (error) {
    console.error("Error creating status page:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const getStatusPageById = async (req: Request, res: Response) => {
  try {
    const statusPageId = req.params.id;
    const userId = req.user;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated ", success: false });
    }

    const statusPage = await StatusPage.findOne({
      _id: statusPageId,
      userId,
    }).populate("monitors", "name url status lastcheckAt");

    if (!statusPage) {
      return res
        .status(404)
        .json({ msg: "Status page not found", success: false });
    }

    res
      .status(200)
      .json({
        msg: "Status page fectched successfully",
        success: true,
        statusPage,
      });
  } catch (error) {
    console.error("Error fetching status page:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const updateStatusPage = async (req: Request, res: Response) => {
  try {
    const statusPageId = req.params.id;
    const userId = req.user;
    const updates = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "user not authenticated", success: false });
    }

    const statusPage = await StatusPage.findOne({ _id: statusPageId, userId });
    if (!statusPage) {
      return res
        .status(404)
        .json({ msg: "Status page nto found", success: false });
    }

    //validate monitor if updates
    if (updates.monitors) {
      const userMonitors = await Monitor.find({
        userId,
        _id: { $in: updates.monitor },
      });
      if (userMonitors.length !== updates.monitor.length) {
        return res.status(400).json({ msg: "Invalid monitor", success: false });
      }
    }

    //check slug unqiness if updated
    if (updates.slug && updates.slug !== statusPage.slug) {
      const existing = await StatusPage.findOne({ slug: updates.slug });
      if (existing) {
        return res
          .status(400)
          .json({ msg: "Slug already exists", succes: false });
      }
    }

    Object.assign(statusPage, updates);
    await statusPage.save();

    res
      .status(200)
      .json({
        msg: "Status page updated successfully",
        success: true,
        statusPage,
      });
  } catch (error) {
    console.log("Error updating status page:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const deleteStatusPage = async (req: Request, res: Response) => {
  try {
    const statusPageId = req.params.id;
    const userId = req.user;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    const statusPage = await StatusPage.findOne({ _id: statusPageId, userId });
    if (!statusPage) {
      return res
        .status(404)
        .json({ msg: "Status page not found", success: false });
    }

    await StatusPage.deleteOne({ _id: statusPageId });

    res.status(200).json({
      msg: "Status page deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting status page:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const getPublicStatusPage = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;

    const statusPage = await StatusPage.findOne({
      slug,
      isPublic: true,
    }).populate("monitors", "name url status lastCheckAt uptimePercentage");

    if (!statusPage) {
      return res
        .status(404)
        .json({ msg: "Status page not found", success: false });
    }

    res.status(200).json({
      msg: "Status page fetched successfully",
      success: true,
      statusPage,
    });
  } catch (error) {
    console.error("Error fetching public status page:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};
