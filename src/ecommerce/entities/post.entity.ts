import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  authorId: string;

  @Column('text')
  content: string;

  @Column()
  views: number;

  @Column()
  createdAt: Date;
}
