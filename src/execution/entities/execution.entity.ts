import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ExecutionStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

@Entity()
export class Execution {
  @PrimaryGeneratedColumn()
  id!: number;

  // 요청 수신 시각 기록
  @CreateDateColumn({ type: 'datetime' })
  receivedAt!: Date;

  // 원본 페이로드 저장
  @Column({ type: 'json' })
  payload!: Record<string, any>;

  // 처리 상태 저장
  @Column({ type: 'enum', enum: ExecutionStatus, default: ExecutionStatus.SUCCESS })
  status!: ExecutionStatus;

  // 재시도 횟수 기록
  @Column({ type: 'int', default: 0 })
  retryCount!: number;

  // 처리 완료 시각
  @Column({ type: 'datetime', nullable: true })
  processedAt!: Date | null;
}
