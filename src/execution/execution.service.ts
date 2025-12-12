import { Injectable } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { CreateExecutionDto } from './dto/create-execution.dto';

@Injectable()
export class ExecutionService {
  constructor(private readonly queueService: QueueService) {}

  // 들어온 실행 요청을 큐로 전달
  async createExecution(dto: CreateExecutionDto): Promise<{ success: boolean }> {
    await this.queueService.enqueue(dto);
    return { success: true };
  }
}
