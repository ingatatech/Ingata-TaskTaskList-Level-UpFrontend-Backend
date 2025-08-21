import "reflect-metadata";
import express from 'express';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import cors from 'cors'; // This is the new import line

import { User } from './entities/User';
import { Task } from './entities/Task';
import userRoutes from '././routes/userRoutes';
import authRoutes from '././routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import adminTaskRoutes from './routes/adminTaskRoutes';

dotenv.config();

const app = express();
app.use(express.json());

// Add the cors middleware here, before your routes
// This allows your frontend (e.g., on localhost:3000) to communicate with your backend
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [User, Task],
  subscribers: [],
  migrations: [],
  ssl: {
    rejectUnauthorized: false,
  },
});

// Correctly use the route files with their respective prefixes
app.use('/api/admin', userRoutes); // All admin routes will start with /api/admin
app.use('/api/auth', authRoutes); // All auth routes will start with /api/auth
app.use('/api', taskRoutes);
app.use('/api/admin', adminTaskRoutes); 

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err); // Typo corrected here
  });
