import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryColumn()
  id: string;

  @Column()
  available: boolean;

  @Column({ nullable: true })
  bookedBy: string;
}
