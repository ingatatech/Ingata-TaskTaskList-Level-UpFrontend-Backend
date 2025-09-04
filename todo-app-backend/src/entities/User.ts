// entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Task } from './Task';
import { Department } from './Department';

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

  // UPDATED: Changed to ManyToOne relationship with Department
  @ManyToOne(() => Department, (department) => department.users, { nullable: true })
  @JoinColumn({ name: "departmentId" })
  department!: Department | null;

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