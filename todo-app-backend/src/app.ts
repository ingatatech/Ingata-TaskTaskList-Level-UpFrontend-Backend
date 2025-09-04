// app.ts (UPDATED)
import "reflect-metadata";
import dotenv from 'dotenv';
dotenv.config(); // <-- load .env first

import express from 'express';
import { DataSource } from 'typeorm';
import cors from 'cors';

import { User } from './entities/User';
import { Task } from './entities/Task';
import { Department } from './entities/Department'; // NEW: Import Department entity
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import adminTaskRoutes from './routes/adminTaskRoutes';
import departmentRoutes from './routes/departmentRoutes'; // NEW: Import department routes

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

// ✅ Use DATABASE_URL instead of separate host/user/password
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,   // Neon connection string
  synchronize: true,               // ⚠️ Turn off in prod if using migrations
  logging: false,
  entities: [User, Task, Department], // NEW: Add Department entity
  subscribers: [],
  migrations: [],
  ssl: {
    rejectUnauthorized: false,     // Required for Neon SSL
  },
});

app.use('/api/admin', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', taskRoutes);
app.use('/api/admin', adminTaskRoutes);
app.use('/api/admin', departmentRoutes); // NEW: Add department routes

AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Data Source has been initialized with Neon!");
    
    // NEW: Initialize default departments
    await initializeDefaultDepartments();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error during Data Source initialization:", err);
  });

// NEW: Function to initialize default departments
async function initializeDefaultDepartments() {
  try {
    const departmentRepository = AppDataSource.getRepository(Department);
    const existingDepts = await departmentRepository.count();
    
    if (existingDepts === 0) {
      const defaultDepartments = [
        { name: 'IT', description: 'Information Technology Department' },
        { name: 'HR', description: 'Human Resources Department' },
        { name: 'Finance', description: 'Finance and Accounting Department' },
        { name: 'Marketing', description: 'Marketing and Sales Department' },
        { name: 'Operations', description: 'Operations Department' },
        { name: 'Sales', description: 'Sales Department' },
        { name: 'Support', description: 'Customer Support Department' }
      ];
      
      for (const dept of defaultDepartments) {
        const department = departmentRepository.create({
          name: dept.name,
          description: dept.description,
          status: 'active'
        });
        await departmentRepository.save(department);
      }
      
      console.log('✅ Default departments initialized successfully!');
    }
  } catch (error) {
    console.error('❌ Error initializing default departments:', error);
  }
}