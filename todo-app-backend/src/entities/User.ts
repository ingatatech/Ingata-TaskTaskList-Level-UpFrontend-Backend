// entities/User.ts
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

  // NEW: Department field
  @Column({
    type: "enum",
    enum: ["IT", "HR", "Finance", "Marketing", "Operations", "Sales", "Support"],
    nullable: true
  })
  department!: "IT" | "HR" | "Finance" | "Marketing" | "Operations" | "Sales" | "Support" | null;

  @Column({ type: 'varchar', nullable: true })
  otp!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiry!: Date | null;

  @Column({ default: true })
  isFirstLogin!: boolean;

  @Column({ type: 'varchar', nullable: true })
  tempPassword!: string | null;

  @OneToMany(() => Task, (task) => task.user, { cascade: true })
  tasks!: Task[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}