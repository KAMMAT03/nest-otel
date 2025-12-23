import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('authors')
export class Author {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column('text')
  bio: string;
}
