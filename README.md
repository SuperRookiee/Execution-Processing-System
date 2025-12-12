# Execution Processing System

NestJS 기반으로 작성된 실행 처리 시스템입니다. API 서버는 요청을 Redis Stream에 적재하고, 별도의 워커 프로세스가 메시지를 소비하여 MySQL DB에 기록합니다.

## 주요 기능
- POST `/execution`: 입력 검증 후 Redis Stream으로 전달
- Redis Producer/Consumer 구성 (Stream 기반)
- 워커 프로세스에서 재시도 및 실패 로그 처리
- TypeORM 엔티티로 Execution/Log 테이블 관리
- k6 부하 테스트 스크립트 제공

## 빠른 시작
1. 의존성 설치: `npm install`
2. 환경 변수 설정 (DB, Redis)
3. API 서버 실행: `npm start`
4. 워커 실행: `npm run worker`
5. k6 테스트: `k6 run k6/execution_test.js`

자세한 실행 방법 및 로직 설명은 `Help.md`를 확인하세요.
