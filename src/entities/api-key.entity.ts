import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
    CreateDateColumn,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiKeyStatus } from '../common/enums/api-key';

@Entity('api_keys')
@Index(['keyHash'])
@Index(['userId'])
export class ApiKey {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'key_hash', unique: true })
    keyHash: string;

    @Column({ length: 100 })
    label: string;

    @Column({ name: 'expires_at', nullable: true })
    expiresAt?: Date;

    @Column({
        type: 'enum',
        enum: ApiKeyStatus,
        default: ApiKeyStatus.ACTIVE,
    })
    status: ApiKeyStatus;

    @Column({ name: 'requests_count', default: 0 })
    requestsCount: number;

    @Column({ name: 'rate_limit_per_minute', default: 100 })
    rateLimitPerMinute: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'last_used_at', nullable: true })
    lastUsedAt?: Date;

    // Relations
    @ManyToOne(() => User, (user) => user.apiKeys)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
