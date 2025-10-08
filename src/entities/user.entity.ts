import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserStatus } from '../common/enums/user';
import { ApiKey } from './api-key.entity';
import { Notification } from './notification.entity';

@Entity('users')
@Index(['username'])
@Index(['email'])
@Index(['status'])
@Index(['activationToken'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: '50', unique: true })
    username: string;

    @Column({ type: 'varchar', length: '255', unique: true })
    email: string;

    @Column({ type: 'varchar', length: '20', nullable: true })
    phone?: string;

    @Exclude()
    @Column({ name: 'password_hash', type: 'varchar', length: '255' })
    passwordHash: string;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    @Column({
        name: 'activation_token',
        type: 'varchar',
        length: '6',
        nullable: true,
    })
    activationToken?: string | null;

    @Column({
        name: 'activation_token_expires',
        type: 'timestamp',
        nullable: true,
    })
    activationTokenExpires?: Date | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    // Relations
    @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
    apiKeys: ApiKey[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];
}
