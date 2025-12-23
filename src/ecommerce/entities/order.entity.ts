import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  status: string;

  @Column('real')
  total: number;

  @Column('text')
  items: string;

  @Column()
  createdAt: Date;
}
