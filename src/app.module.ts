import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionModule } from './execution/execution.module';
import { QueueModule } from './queue/queue.module';
import { Execution } from './execution/entities/execution.entity';
import { Log } from './execution/entities/log.entity';

@Module({
  imports: [
    // 데이터베이스 연결 설정 (환경 변수 기반)
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'execution_db',
      entities: [Execution, Log],
      synchronize: true,
    }),
    QueueModule,
    ExecutionModule,
  ],
})
export class AppModule {}
