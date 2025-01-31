import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
