// app.ts
import "reflect-metadata";
import dotenv from 'dotenv';
dotenv.config(); // <-- load .env first

import express from 'express';
import { DataSource } from 'typeorm';
import cors from 'cors';

import { User } from './entities/User';
import { Task } from './entities/Task';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import adminTaskRoutes from './routes/adminTaskRoutes';

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
  entities: [User, Task],
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

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Data Source has been initialized with Neon!");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error during Data Source initialization:", err);
  });
