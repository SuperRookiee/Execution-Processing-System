# 실행 방법 및 로직 설명 (Execution Processing System)

## 사전 준비
- Node.js 22+와 npm
- MySQL, Redis 실행 환경
- 환경 변수 설정 (필요 시 `.env`):
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - `REDIS_HOST`, `REDIS_PORT`
  - `EXECUTION_STREAM` (기본값: `execution_stream`)

## 설치 및 실행 절차
1. 의존성 설치: `npm install`
2. API 서버 실행 (Nest): `npm start`
3. 개발 모드 실행: `npm run start:dev`
4. 워커 프로세스 실행: `npm run worker`
5. k6 부하 테스트: `k6 run k6/execution_test.js`

## 시스템 동작 흐름
1. 클라이언트가 `POST /execution`으로 `{ timestamp, randomKey, index }` 전송
2. **컨트롤러/서비스**: DTO로 입력 검증 후 Redis Stream에 XADD
3. **워커**: XREADGROUP으로 메시지 소비 → 처리 로직 실행 → DB에 Execution 레코드 저장
4. 처리 실패 시 재시도 최대 3회. `attempt` 값이 4회차에 도달하면 Execution.status를 `FAIL`로 저장하고 Log 테이블에 실패 내역 기록

## 기대 동작
- 유효한 요청 → `{ "success": true }` 응답 및 Redis Stream에 메시지 적재
- 워커 실행 중이면 메시지가 소비되어 Execution 테이블에 SUCCESS 기록
- 장애 발생 시 최대 3회까지 자동 재시도 후 실패 시 Log 테이블에 누적

## 추가 참고
- 모든 주요 함수에 한글 주석으로 로직 설명 포함
- TypeORM `synchronize: true`로 초기 개발 편의를 제공 (운영 시에는 마이그레이션 권장)
