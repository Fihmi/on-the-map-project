import { Request, Response, NextFunction } from 'express';

export const adminProtect = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const adminPassword = req.headers['x-admin-password'];
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin1230';

    if (!adminPassword || adminPassword !== expectedPassword) {
      res.status(401).json({ success: false, message: 'Unauthorized: Invalid admin password.' });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error in admin authentication.' });
  }
};
