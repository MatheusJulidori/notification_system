import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner, EntityManager } from 'typeorm';

@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    async executeInTransaction<T>(
        operation: (queryRunner: QueryRunner) => Promise<T>,
    ): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await operation(queryRunner);
            await queryRunner.commitTransaction();

            this.logger.debug('Transaction committed successfully');
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Transaction rolled back due to error:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async executeWithManager<T>(
        operation: (manager: EntityManager) => Promise<T>,
    ): Promise<T> {
        return this.dataSource.transaction(async (manager) => {
            try {
                const result = await operation(manager);
                this.logger.debug(
                    'Entity Manager transaction completed successfully',
                );
                return result;
            } catch (error) {
                this.logger.error('Entity Manager transaction failed:', error);
                throw error;
            }
        });
    }

    createQueryBuilder() {
        return this.dataSource.createQueryBuilder();
    }

    createQueryRunner(): QueryRunner {
        return this.dataSource.createQueryRunner();
    }

    async isHealthy(): Promise<boolean> {
        try {
            await this.dataSource.query('SELECT 1');
            return true;
        } catch (error) {
            this.logger.error('Database health check failed:', error);
            return false;
        }
    }

    getConnectionPoolStats() {
        const driver = this.dataSource.driver as any;
        if (driver && driver.master) {
            return {
                totalCount: driver.master.totalCount || 0,
                idleCount: driver.master.idleCount || 0,
                waitingCount: driver.master.waitingCount || 0,
            };
        }
        return null;
    }
}
