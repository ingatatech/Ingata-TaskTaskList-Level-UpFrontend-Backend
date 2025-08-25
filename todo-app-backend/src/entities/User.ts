// ===== 1. MODIFIED entities/User.ts =====
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Task } from './Task';

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: "enum",
    enum: ["admin", "user"],
    default: "user"
  })
  role!: "admin" | "user";

  @Column({
    type: "enum",
    enum: ["active", "inactive"],
    default: "active"
  })
  status!: "active" | "inactive";

  @Column({ type: 'varchar', nullable: true })
  otp!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiry!: Date | null;

  // NEW FIELD FOR FIRST LOGIN CHECK
  @Column({ default: true })
  isFirstLogin!: boolean;

  // NEW FIELD FOR TEMP RANDOM PASSWORD
  @Column({ type: 'varchar', nullable: true })
  tempPassword!: string | null;

  @OneToMany(() => Task, (task) => task.user, { cascade: true }) // CASCADE DELETE FIX
  tasks!: Task[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
