import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column('real')
  price: number;

  @Column()
  category: string;

  @Column()
  stock: number;

  @Column('text')
  description: string;
}
