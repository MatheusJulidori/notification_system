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
@Index(['userId'])
@Index(['keyHash'])
@Index(['status'])
export class ApiKey {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'key_hash', type: 'varchar', length: '255', unique: true })
    keyHash: string;

    @Column({ type: 'varchar', length: '100' })
    label: string;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt?: Date;

    @Column({
        type: 'enum',
        enum: ApiKeyStatus,
        default: ApiKeyStatus.ACTIVE,
    })
    status: ApiKeyStatus;

    @Column({ name: 'requests_count', type: 'integer', default: 0 })
    requestsCount: number;

    @Column({ name: 'rate_limit_per_minute', type: 'integer', default: 100 })
    rateLimitPerMinute: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
    lastUsedAt?: Date;

    // Relations
    @ManyToOne(() => User, (user) => user.apiKeys)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
