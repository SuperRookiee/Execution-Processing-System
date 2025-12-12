import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Execution } from './execution.entity';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id!: number;

  // 실패한 실행과의 관계 설정
  @ManyToOne(() => Execution, { nullable: true })
  execution!: Execution | null;

  // 에러 메시지 저장
  @Column({ type: 'text' })
  errorMessage!: string;

  // 실패 발생 시각 기록
  @CreateDateColumn({ type: 'datetime' })
  failedAt!: Date;

  // 실패 당시 페이로드 저장
  @Column({ type: 'json', nullable: true })
  payload!: Record<string, any> | null;
}
