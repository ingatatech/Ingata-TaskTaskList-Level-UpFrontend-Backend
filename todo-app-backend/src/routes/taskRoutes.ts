//(routes/taskRoutes.ts)
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { authMiddleware } from '../middlewares/authMiddleware';
import { ILike } from 'typeorm';

// Extend the Express Request type to include the user property
interface AuthRequest extends Request {
  user?: { id: string; role: 'admin' | 'user' };
}

const router = Router();

// Create a new task
router.post('/tasks', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const taskRepository = AppDataSource.getRepository(Task);
    const newTask = taskRepository.create({ title, description, user });
    await taskRepository.save(newTask);

    res.status(201).json(newTask);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Get all tasks for the authenticated user, with optional filtering and pagination
router.get('/tasks', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, status, title } = req.query; // Extract page and limit
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    if (!userId) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    const taskRepository = AppDataSource.getRepository(Task);
    let whereCondition: any = { user: { id: userId } };

    // If a status query parameter is provided, add it to the where condition
    if (status && (status === 'pending' || status === 'completed')) {
      whereCondition.status = status;
    }

    // If a title query parameter is provided, add it to the where condition with ILike
    if (title) {
      whereCondition.title = ILike(`%${title}%`);
    }

    // Use findAndCount for pagination
    const [tasks, total] = await taskRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip,
      take: parseInt(limit as string),
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

// Get a single task by ID for the authenticated user
router.get('/tasks/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    const taskRepository = AppDataSource.getRepository(Task);
    const task = await taskRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or does not belong to you.' });
    }

    res.status(200).json(task);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Update a task
router.put('/tasks/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.user?.id;

    const taskRepository = AppDataSource.getRepository(Task);
    const task = await taskRepository.findOne({ where: { id, user: { id: userId } } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or does not belong to you.' });
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    await taskRepository.save(task);

    res.status(200).json(task);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

// Delete a task
router.delete('/tasks/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const taskRepository = AppDataSource.getRepository(Task);
    const result = await taskRepository.delete({ id, user: { id: userId } });

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Task not found or does not belong to you.' });
    }

    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error(errorMessage);
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

export default router;
