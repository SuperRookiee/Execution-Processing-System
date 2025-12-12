import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import { Execution, ExecutionStatus } from '../../src/execution/entities/execution.entity';
import { Log } from '../../src/execution/entities/log.entity';

// Redis 스트림과 그룹 설정
const streamKey = process.env.EXECUTION_STREAM || 'execution_stream';
const groupName = process.env.EXECUTION_GROUP || 'execution_group';
const consumerName = process.env.EXECUTION_CONSUMER || 'worker-1';

// Redis 클라이언트 생성
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
});

// TypeORM 데이터소스 생성
const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'execution_db',
  entities: [Execution, Log],
  synchronize: true,
});

// 재시도 헬퍼 함수: 실패 시 재큐잉 또는 로그 저장
async function retryExecution(payload: any, attempt: number, error: Error) {
  if (attempt <= 3) {
    // 재시도 횟수 3회까지 재큐잉
    await redis.xadd(streamKey, '*', 'payload', JSON.stringify({ ...payload, attempt }));
    console.warn(`재시도 ${attempt}회차로 재큐잉`);
  } else {
    // 3회 초과 시 실패로 기록
    const executionRepo = dataSource.getRepository(Execution);
    const logRepo = dataSource.getRepository(Log);
    const execution = executionRepo.create({
      payload,
      retryCount: attempt - 1,
      status: ExecutionStatus.FAIL,
      processedAt: new Date(),
    });
    await executionRepo.save(execution);
    await logRepo.save(
      logRepo.create({
        execution,
        errorMessage: error.message,
        payload,
      }),
    );
    console.error('재시도 초과로 실패 기록');
  }
}

// 실제 처리 로직: 단순히 DB에 성공 상태 저장
async function processExecution(payload: any, attempt: number) {
  const executionRepo = dataSource.getRepository(Execution);
  const execution = executionRepo.create({
    payload,
    retryCount: attempt,
    status: ExecutionStatus.SUCCESS,
    processedAt: new Date(),
  });
  await executionRepo.save(execution);
}

async function ensureGroup() {
  try {
    // 소비자 그룹이 없으면 생성
    await redis.xgroup('CREATE', streamKey, groupName, '$', 'MKSTREAM');
    console.log('소비자 그룹 생성 완료');
  } catch (error: any) {
    // 이미 존재하는 경우 에러를 무시
    if (!String(error?.message).includes('BUSYGROUP')) {
      throw error;
    }
  }
}

async function runWorker() {
  await dataSource.initialize();
  await ensureGroup();
  console.log('워커 시작');

  while (true) {
    // 블록 방식으로 메시지 소비
    const streams = await redis.xreadgroup(
      'GROUP',
      groupName,
      consumerName,
      'BLOCK',
      5000,
      'COUNT',
      1,
      'STREAMS',
      streamKey,
      '>',
    );

    if (!streams) {
      continue;
    }

    for (const stream of streams) {
      const messages = stream[1];
      for (const message of messages) {
        const messageId = message[0];
        const fields = message[1];
        const payloadIndex = fields.findIndex((field: string) => field === 'payload');
        const payloadRaw = payloadIndex >= 0 ? fields[payloadIndex + 1] : '{}';
        const payload = JSON.parse(payloadRaw);
        const attempt = Number(payload.attempt ?? 0);

        try {
          // 메시지 처리
          await processExecution(payload, attempt);
          await redis.xack(streamKey, groupName, messageId);
          console.log(`${messageId} 처리 성공`);
        } catch (error: any) {
          // 실패 시 재시도 또는 실패 기록
          await redis.xack(streamKey, groupName, messageId);
          await retryExecution(payload, attempt + 1, error);
        }
      }
    }
  }
}

runWorker().catch((error) => {
  console.error('워커 치명적 에러', error);
  process.exit(1);
});
