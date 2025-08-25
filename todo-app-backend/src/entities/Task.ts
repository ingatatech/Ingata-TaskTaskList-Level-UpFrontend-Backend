//entities/Task.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column({
    type: "enum",
    enum: ["pending", "completed"],
    default: "pending"
  })
  status!: "pending" | "completed";

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' }) // CASCADE DELETE FIX
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
