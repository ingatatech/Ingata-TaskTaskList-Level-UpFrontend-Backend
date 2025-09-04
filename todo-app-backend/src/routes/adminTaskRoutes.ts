// routes/adminTaskRoutes.ts
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import { ILike } from 'typeorm';

// Extend the Express Request type for middleware
interface AuthRequest extends Request {
  user?: { id: string; role: 'admin' | 'user' };
}

const router = Router();

// UPDATED: Admin get all tasks with department filtering support
router.get('/tasks/all', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, title, departmentId, userEmail } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereCondition: any = {};

    // Filter by task status
    if (status && (status === 'pending' || status === 'completed')) {
      whereCondition.status = status;
    }

    // Filter by task title
    if (title) {
      whereCondition.title = ILike(`%${title}%`);
    }

    // NEW: Filter by user's department using the departmentId
    if (departmentId) {
      // We need to create a nested where condition to filter by the user's department.
      whereCondition.user = { department: { id: departmentId } };
    }

    // NEW: Filter by user's email
    if (userEmail) {
      // Check if a user condition already exists from the department filter
      if (whereCondition.user) {
        whereCondition.user.email = ILike(`%${userEmail}%`);
      } else {
        whereCondition.user = { email: ILike(`%${userEmail}%`) };
      }
    }

    const taskRepository = AppDataSource.getRepository(Task);
    const [tasks, total] = await taskRepository.findAndCount({
      where: whereCondition,
      // FIXED: Use nested relations to load both the user and their department
      relations: ['user', 'user.department'],
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
      // FIXED: Use nested relations to load both the user and their department
      relations: ['user', 'user.department'],
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

// NEW: Get tasks statistics by department
router.get('/tasks/stats/department', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const taskRepository = AppDataSource.getRepository(Task);

    // Get all users with their task counts grouped by department
    const departmentStats = await userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.tasks', 'task')
      .leftJoinAndSelect('user.department', 'department') // NEW: Explicitly join the department
      .select([
        'department.name as departmentName', // Select the department name
        'COUNT(DISTINCT user.id) as userCount',
        'COUNT(task.id) as totalTasks',
        'COUNT(CASE WHEN task.status = \'pending\' THEN 1 END) as pendingTasks',
        'COUNT(CASE WHEN task.status = \'completed\' THEN 1 END) as completedTasks'
      ])
      .where('user.department IS NOT NULL')
      .groupBy('department.name')
      .getRawMany();

    res.status(200).json({ departmentStats });
  } catch (error) {
    console.error('Error fetching department statistics:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
