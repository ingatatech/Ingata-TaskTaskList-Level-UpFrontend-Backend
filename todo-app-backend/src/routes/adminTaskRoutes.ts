import { Router, Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Task } from '../entities/Task';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import { ILike } from 'typeorm';

// Extend the Express Request type for middleware
interface AuthRequest extends Request {
  user?: { id: string; role: 'admin' | 'user' };
}

const router = Router();

// Endpoint for Admin to get all tasks from all users, with pagination and filtering
router.get('/tasks/all', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, title } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereCondition: any = {};

    // If a status query parameter is provided, add it to the where condition
    if (status && (status === 'pending' || status === 'completed')) {
      whereCondition.status = status;
    }

    // If a title query parameter is provided, add it to the where condition with ILike
    if (title) {
      whereCondition.title = ILike(`%${title}%`);
    }

    const taskRepository = AppDataSource.getRepository(Task);
    const [tasks, total] = await taskRepository.findAndCount({
      where: whereCondition,
      relations: ['user'], // This joins the user information with each task
      skip,
      take: parseInt(limit as string),
      order: { createdAt: 'DESC' },
    });

    res.status(200).json({
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      data: tasks,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Endpoint for Admin to get all tasks for a specific user, with pagination and filtering
router.get('/tasks/user/:userId', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status, title } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereCondition: any = { user: { id: userId } };

    if (status && (status === 'pending' || status === 'completed')) {
      whereCondition.status = status;
    }

    if (title) {
      whereCondition.title = ILike(`%${title}%`);
    }

    const taskRepository = AppDataSource.getRepository(Task);
    const [tasks, total] = await taskRepository.findAndCount({
      where: whereCondition,
      relations: ['user'],
      skip,
      take: parseInt(limit as string),
      order: { createdAt: 'DESC' },
    });

    if (tasks.length === 0 && total === 0) {
      return res.status(404).json({ message: 'No tasks found for this user.' });
    }

    res.status(200).json({
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      data: tasks,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

export default router;
