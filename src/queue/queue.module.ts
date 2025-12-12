import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { redisProvider } from './redis.provider';

@Module({
  providers: [redisProvider, QueueService],
  exports: [QueueService, redisProvider],
})
export class QueueModule {}
