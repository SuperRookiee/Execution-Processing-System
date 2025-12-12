import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.provider';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private readonly streamKey = process.env.EXECUTION_STREAM || 'execution_stream';

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  // Redis Stream에 메시지를 추가하는 함수
  async enqueue(payload: Record<string, any>, attempt = 0): Promise<string> {
    const entryId = await this.redisClient.xadd(
      this.streamKey,
      '*',
      'payload',
      JSON.stringify({ ...payload, attempt }),
    );
    this.logger.log(`큐에 메시지 추가: ${entryId}`);
    return entryId;
  }
}
