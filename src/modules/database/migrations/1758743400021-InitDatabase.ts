import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex,
    TableForeignKey,
} from 'typeorm';

export class InitDatabase1758743400021 implements MigrationInterface {
    name = 'InitDatabase1758743400021';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'username',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '255',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'phone',
                        type: 'varchar',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'password_hash',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
                        default: "'ACTIVE'",
                    },
                    {
                        name: 'activation_token',
                        type: 'varchar',
                        length: '6',
                        isNullable: true,
                    },
                    {
                        name: 'activation_token_expires',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
        );

        // Create api_keys table
        await queryRunner.createTable(
            new Table({
                name: 'api_keys',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'key_hash',
                        type: 'varchar',
                        length: '255',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'label',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'expires_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['ACTIVE', 'DISABLED', 'EXPIRED'],
                        default: "'ACTIVE'",
                    },
                    {
                        name: 'requests_count',
                        type: 'integer',
                        default: 0,
                    },
                    {
                        name: 'rate_limit_per_minute',
                        type: 'integer',
                        default: 100,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'last_used_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
            }),
        );

        // Create notifications table
        await queryRunner.createTable(
            new Table({
                name: 'notifications',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'api_key_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: [
                            'EMAIL',
                            'SMS',
                            'TELEGRAM',
                            'WHATSAPP',
                            'PUSH',
                            'IN_APP',
                        ],
                        isNullable: false,
                    },
                    {
                        name: 'destination',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'message',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: [
                            'PENDING',
                            'SENT',
                            'FAILED',
                            'DELIVERED',
                            'READ',
                        ],
                        default: "'PENDING'",
                    },
                    {
                        name: 'priority',
                        type: 'enum',
                        enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
                        default: "'NORMAL'",
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'queued_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'sent_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'failed_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'delivered_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'retry_count',
                        type: 'integer',
                        default: 0,
                    },
                    {
                        name: 'max_retries',
                        type: 'integer',
                        default: 3,
                    },
                    {
                        name: 'next_retry_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'last_error',
                        type: 'text',
                        isNullable: true,
                    },
                ],
            }),
        );

        // API Keys Foreign Key
        await queryRunner.createForeignKey(
            'api_keys',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                name: 'fk_api_keys_user_id',
            }),
        );

        // Notifications Foreign Key
        await queryRunner.createForeignKey(
            'notifications',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                name: 'fk_notifications_user_id',
            }),
        );

        await queryRunner.createForeignKey(
            'notifications',
            new TableForeignKey({
                columnNames: ['api_key_id'],
                referencedTableName: 'api_keys',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                name: 'fk_notifications_api_key_id',
            }),
        );

        // Users Indexes
        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'idx_users_username',
                columnNames: ['username'],
            }),
        );

        await queryRunner.createIndex(
            'users',
            new TableIndex({ name: 'idx_users_email', columnNames: ['email'] }),
        );

        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'idx_users_status',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'idx_users_activation_token',
                columnNames: ['activation_token'],
            }),
        );

        // API Keys Indexes
        await queryRunner.createIndex(
            'api_keys',
            new TableIndex({
                name: 'idx_api_keys_user_id',
                columnNames: ['user_id'],
            }),
        );

        await queryRunner.createIndex(
            'api_keys',
            new TableIndex({
                name: 'idx_api_keys_hash',
                columnNames: ['key_hash'],
            }),
        );

        await queryRunner.createIndex(
            'api_keys',
            new TableIndex({
                name: 'idx_api_keys_status',
                columnNames: ['status'],
            }),
        );

        // Notifications Indexes
        await queryRunner.createIndex(
            'notifications',
            new TableIndex({
                name: 'idx_notifications_user_id',
                columnNames: ['user_id'],
            }),
        );

        await queryRunner.createIndex(
            'notifications',
            new TableIndex({
                name: 'idx_notifications_api_key_id',
                columnNames: ['api_key_id'],
            }),
        );

        await queryRunner.createIndex(
            'notifications',
            new TableIndex({
                name: 'idx_notifications_status',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createIndex(
            'notifications',
            new TableIndex({
                name: 'idx_notifications_type',
                columnNames: ['type'],
            }),
        );

        await queryRunner.createIndex(
            'notifications',
            new TableIndex({
                name: 'idx_notifications_created_at',
                columnNames: ['created_at'],
            }),
        );

        await queryRunner.createIndex(
            'notifications',
            new TableIndex({
                name: 'idx_notifications_next_retry_at',
                columnNames: ['next_retry_at'],
            }),
        );

        await queryRunner.createIndex(
            'notifications',
            new TableIndex({
                name: 'idx_notifications_user_status',
                columnNames: ['user_id', 'status'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('notifications');
        await queryRunner.dropTable('api_keys');
        await queryRunner.dropTable('users');
    }
}
