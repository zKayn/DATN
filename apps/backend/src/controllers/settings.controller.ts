import { Request, Response } from 'express';
import Settings from '../models/Settings';

// Get settings (public - no auth required for read)
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    // There should only be one settings document
    let settings = await Settings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    console.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải cài đặt',
      error: error.message
    });
  }
};

// Update settings (admin only)
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData = req.body;

    // Find the settings document
    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings if none exist
      settings = await Settings.create(updateData);
    } else {
      // Update existing settings
      Object.assign(settings, updateData);
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật cài đặt thành công',
      data: settings
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật cài đặt',
      error: error.message
    });
  }
};
