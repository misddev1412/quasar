import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('visitor_statistics')
export class VisitorStatistics {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date', unique: true })
    date: string;

    @Column({ name: 'total_visitors', type: 'int', default: 0 })
    totalVisitors: number;

    @Column({ name: 'new_visitors', type: 'int', default: 0 })
    newVisitors: number;

    @Column({ name: 'returning_visitors', type: 'int', default: 0 })
    returningVisitors: number;

    @Column({ name: 'total_sessions', type: 'int', default: 0 })
    totalSessions: number;

    @Column({ name: 'total_page_views', type: 'int', default: 0 })
    totalPageViews: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
