// routes/departmentRoutes.ts (FIXED WITH PROPER PAGINATION)
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Department } from '../entities/Department';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import { ILike } from 'typeorm';

interface AuthRequest extends Request {
  user?: { id: string; role: 'admin' | 'user' };
}

const router = Router();

// COUNT ALL DEPARTMENTS
router.get('/departments/count', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const total = await AppDataSource.getRepository(Department).count();
    res.status(200).json({ total });
  } catch (error) {
    console.error('Error counting departments:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// COUNT ACTIVE DEPARTMENTS
router.get('/departments/count/active', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const activeCount = await AppDataSource.getRepository(Department).count({ 
      where: { status: 'active' } 
    });
    res.status(200).json({ total: activeCount });
  } catch (error) {
    console.error('Error counting active departments:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET ALL DEPARTMENTS WITH PROPER PAGINATION (FIXED)
router.get('/departments', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, name, status } = req.query;
    const departmentRepository = AppDataSource.getRepository(Department);

    // FIXED: Always handle pagination consistently like user routes
    if (page && limit) {
      // Paginated response for admin dashboard
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      let whereCondition: any = {};
      if (name) whereCondition.name = ILike(`%${name}%`);
      if (status) whereCondition.status = status;

      const [departments, total] = await departmentRepository.findAndCount({
        where: whereCondition,
        skip,
        take: parseInt(limit as string),
        order: { createdAt: 'DESC' }, // Changed to match user pattern
        relations: ['users'] // Include user count
      });

      res.status(200).json({
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        data: departments.map(dept => ({
          ...dept,
          userCount: dept.users.length,
          users: undefined // Remove users array from response, just keep count
        }))
      });
    } else {
      // Simple list for dropdowns (no pagination needed)
      const departments = await departmentRepository.find({
        where: { status: 'active' },
        order: { name: 'ASC' },
        select: ['id', 'name', 'description']
      });
      
      res.status(200).json({ departments });
    }
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET SINGLE DEPARTMENT
router.get('/departments/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const department = await AppDataSource.getRepository(Department).findOne({
      where: { id: req.params.id },
      relations: ['users']
    });
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    
    res.status(200).json({
      ...department,
      userCount: department.users.length
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// CREATE DEPARTMENT (Admin only)
router.post('/departments', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, status } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Department name is required.' });
    }

    const departmentRepository = AppDataSource.getRepository(Department);
    
    // Check if department already exists
    const existingDept = await departmentRepository.findOne({ 
      where: { name: name.trim() } 
    });
    
    if (existingDept) {
      return res.status(409).json({ message: 'Department with this name already exists.' });
    }

    const department = departmentRepository.create({
      name: name.trim(),
      description: description?.trim() || null,
      status: status || 'active'
    });

    await departmentRepository.save(department);
    
    res.status(201).json({
      message: 'Department created successfully.',
      department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// UPDATE DEPARTMENT (Admin only)
router.put('/departments/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, status } = req.body;
    const departmentRepository = AppDataSource.getRepository(Department);
    
    const department = await departmentRepository.findOne({ 
      where: { id: req.params.id } 
    });
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    // Check if new name conflicts with existing departments
    if (name && name.trim() !== department.name) {
      const existingDept = await departmentRepository.findOne({
        where: { name: name.trim() }
      });
      
      if (existingDept) {
        return res.status(409).json({ message: 'Department with this name already exists.' });
      }
    }

    department.name = name?.trim() ?? department.name;
    department.description = description?.trim() ?? department.description;
    department.status = status ?? department.status;

    await departmentRepository.save(department);
    
    res.status(200).json({
      message: 'Department updated successfully.',
      department
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE DEPARTMENT (Admin only)
router.delete('/departments/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const departmentRepository = AppDataSource.getRepository(Department);
    const department = await departmentRepository.findOne({
      where: { id: req.params.id },
      relations: ['users']
    });
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    // Check if department has users
    if (department.users && department.users.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete department. It has ${department.users.length} user(s) assigned to it. Please reassign or remove users first.`,
        userCount: department.users.length
      });
    }

    await departmentRepository.remove(department);
    
    res.status(200).json({ 
      message: 'Department deleted successfully.' 
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET DEPARTMENT STATISTICS (Admin only)
router.get('/departments/stats/overview', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const departmentRepository = AppDataSource.getRepository(Department);
    
    const [departments, totalDepartments] = await departmentRepository.findAndCount({
      relations: ['users'],
      order: { name: 'ASC' }
    });

    const activeDepartments = departments.filter(d => d.status === 'active').length;
    const departmentStats = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      status: dept.status,
      userCount: dept.users.length,
      activeUsers: dept.users.filter(u => u.status === 'active').length
    }));

    res.status(200).json({
      totalDepartments,
      activeDepartments,
      inactiveDepartments: totalDepartments - activeDepartments,
      departmentStats
    });
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;