import { Body, Controller, Post } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { CreateExecutionDto } from './dto/create-execution.dto';

@Controller('execution')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  // POST /execution 엔드포인트에서 유효성 검증 후 큐에 적재
  @Post()
  async create(@Body() createExecutionDto: CreateExecutionDto) {
    return this.executionService.createExecution(createExecutionDto);
  }
}
