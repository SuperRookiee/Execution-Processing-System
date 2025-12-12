import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

// 간단한 부하 테스트로 /execution 호출
export default function () {
  const payload = {
    timestamp: Date.now(),
    randomKey: Math.random().toString(36).substring(2, 12).padEnd(10, '0'),
    index: Math.floor(Math.random() * 1000),
  };

  const res = http.post('http://localhost:3000/execution', JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 201 or 200': (r) => r.status === 201 || r.status === 200,
  });

  sleep(1);
}
