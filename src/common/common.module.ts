import { Module, Global } from '@nestjs/common';
import { AppLoggerService } from './services/logger.service';

@Global()
@Module({
    providers: [AppLoggerService],
    exports: [AppLoggerService],
})
export class CommonModule {}
