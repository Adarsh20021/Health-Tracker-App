import express, { Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all log routes
router.use(authenticateToken);

// POST /api/log -> save daily health data
router.post('/log', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, calories, water, steps, sleepHours } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!date) {
      res.status(400).json({ error: 'Date is required' });
      return;
    }

    // Simple date regex check (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      res.status(400).json({ error: 'Invalid date format, must be YYYY-MM-DD' });
      return;
    }

    const parsedCalories = Number(calories);
    const parsedWater = Number(water);
    const parsedSteps = Number(steps);
    const parsedSleep = Number(sleepHours);

    // Validation
    if (isNaN(parsedCalories) || parsedCalories < 0) {
      res.status(400).json({ error: 'Calories must be a positive number' });
      return;
    }
    if (isNaN(parsedWater) || parsedWater < 0) {
      res.status(400).json({ error: 'Water intake must be a positive number' });
      return;
    }
    if (isNaN(parsedSteps) || parsedSteps < 0) {
      res.status(400).json({ error: 'Steps must be a positive number' });
      return;
    }
    if (isNaN(parsedSleep) || parsedSleep < 0 || parsedSleep > 24) {
      res.status(400).json({ error: 'Sleep hours must be between 0 and 24' });
      return;
    }

    // Upsert the log for this user and day
    const savedLog = await db.logs.updateOrCreate(
      { userId, date },
      {
        calories: parsedCalories,
        water: parsedWater,
        steps: parsedSteps,
        sleepHours: parsedSleep,
      }
    );

    res.status(200).json({
      message: 'Log entry saved successfully',
      log: savedLog,
    });
  } catch (error) {
    console.error('Error saving daily log:', error);
    res.status(500).json({ error: 'An error occurred while saving the log.' });
  }
});

// GET /api/history -> return all logs sorted by date
router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const logs = await db.logs.find({ userId });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'An error occurred while fetching log history.' });
  }
});

// GET /api/summary -> return summary statistics
router.get('/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const logs = await db.logs.find({ userId });

    let totalCalories = 0;
    let totalWater = 0;
    let totalSteps = 0;
    let sumSleep = 0;

    for (const log of logs) {
      totalCalories += log.calories || 0;
      totalWater += log.water || 0;
      totalSteps += log.steps || 0;
      sumSleep += log.sleepHours || 0;
    }

    const averageSleep = logs.length > 0 ? Number((sumSleep / logs.length).toFixed(1)) : 0;
    // Format water to 2 decimal places to avoid precision issues
    const formattedTotalWater = Number(totalWater.toFixed(2));

    res.json({
      totalCalories,
      totalWater: formattedTotalWater,
      totalSteps,
      averageSleep,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'An error occurred while generating statistics summary.' });
  }
});

export default router;
