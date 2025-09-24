import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import {
    NotificationType,
    NotificationStatus,
    Priority,
} from '../common/enums/notification';
import { ApiKey } from './api-key.entity';

@Entity('notifications')
@Index(['userId', 'status'])
@Index(['status'])
@Index(['nextRetryAt'])
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'api_key_id' })
    apiKeyId: string;

    // Content
    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column()
    destination: string;

    @Column()
    title: string;

    @Column('text')
    message: string;

    @Column('json', { nullable: true })
    metadata?: Record<string, any>;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.PENDING,
    })
    status: NotificationStatus;

    @Column({
        type: 'enum',
        enum: Priority,
        default: Priority.NORMAL,
    })
    priority: Priority;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'queued_at', nullable: true })
    queuedAt?: Date;

    @Column({ name: 'sent_at', nullable: true })
    sentAt?: Date;

    @Column({ name: 'failed_at', nullable: true })
    failedAt?: Date;

    @Column({ name: 'delivered_at', nullable: true })
    deliveredAt?: Date;

    @Column({ name: 'retry_count', default: 0 })
    retryCount: number;

    @Column({ name: 'max_retries', default: 3 })
    maxRetries: number;

    @Column({ name: 'next_retry_at', nullable: true })
    nextRetryAt?: Date;

    @Column({ name: 'last_error', nullable: true, type: 'text' })
    lastError?: string;

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => ApiKey)
    @JoinColumn({ name: 'api_key_id' })
    apiKey: ApiKey;
}
