import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionService } from './execution.service';
import { ExecutionController } from './execution.controller';
import { Execution } from './entities/execution.entity';
import { Log } from './entities/log.entity';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [TypeOrmModule.forFeature([Execution, Log]), QueueModule],
  controllers: [ExecutionController],
  providers: [ExecutionService],
})
export class ExecutionModule {}
