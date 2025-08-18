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

  @Column({ type: 'varchar', nullable: true }) // <-- Changed this line
  otp!: string | null;

  @Column({ type: 'timestamp', nullable: true }) // <-- Changed this line
  otpExpiry!: Date | null;
  
  @OneToMany(() => Task, (task) => task.user)
  tasks!: Task[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}