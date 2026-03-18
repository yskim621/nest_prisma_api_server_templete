/**
 * BullMQ Load Test Script
 *
 * 사용법:
 * npx ts-node test/bull-load-test.ts
 *
 * 또는 Docker 내부에서:
 * docker exec -it nest-api-dev npx ts-node test/bull-load-test.ts
 */
export {};

const API_BASE = process.env.API_BASE || 'http://localhost:4010';

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: {
    jobId?: string;
    [key: string]: unknown;
  };
}

interface JobStatusResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    state: string;
    progress: number | string | object;
    result?: unknown;
    failedReason?: string;
  };
}

async function sendRequest(endpoint: string, method: string, body?: object): Promise<ApiResponse> {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return response.json() as Promise<ApiResponse>;
}

async function checkQueueStatus(): Promise<void> {
  console.log('\n📊 큐 상태 확인...');
  const status = await sendRequest('/bull/status', 'GET');
  console.log('Queue Status:', JSON.stringify(status.data, null, 2));
}

async function checkJobStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await fetch(`${API_BASE}/bull/job/${jobId}`);
  return response.json() as Promise<JobStatusResponse>;
}

async function waitForJobCompletion(jobId: string, maxWaitMs = 30000): Promise<JobStatusResponse> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const status = await checkJobStatus(jobId);

    if (status.data?.state === 'completed' || status.data?.state === 'failed') {
      return status;
    }

    console.log(`  Job ${jobId}: ${status.data?.state} (progress: ${status.data?.progress})`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Job ${jobId} did not complete within ${maxWaitMs}ms`);
}

async function testEmailJob(): Promise<void> {
  console.log('\n📧 이메일 작업 테스트...');

  const result = await sendRequest('/bull/email', 'POST', {
    to: 'test@example.com',
    subject: 'BullMQ Test',
    body: 'This is a test email from BullMQ',
  });

  console.log('Job added:', result.data);

  if (result.data?.jobId) {
    const finalStatus = await waitForJobCompletion(result.data.jobId);
    console.log('✅ Email job completed:', finalStatus.data?.state);
    console.log('   Result:', finalStatus.data?.result);
  }
}

async function testNotificationJob(): Promise<void> {
  console.log('\n🔔 알림 작업 테스트...');

  const result = await sendRequest('/bull/notification', 'POST', {
    userId: 123,
    message: 'Hello from BullMQ!',
  });

  console.log('Job added:', result.data);

  if (result.data?.jobId) {
    const finalStatus = await waitForJobCompletion(result.data.jobId);
    console.log('✅ Notification job completed:', finalStatus.data?.state);
  }
}

async function testDataProcessingJob(): Promise<void> {
  console.log('\n⚙️ 데이터 처리 작업 테스트...');

  const result = await sendRequest('/bull/data-processing', 'POST', {
    data: { items: [1, 2, 3, 4, 5], operation: 'sum' },
  });

  console.log('Job added:', result.data);

  if (result.data?.jobId) {
    const finalStatus = await waitForJobCompletion(result.data.jobId);
    console.log('✅ Data processing job completed:', finalStatus.data?.state);
  }
}

async function testDelayedJob(): Promise<void> {
  console.log('\n⏰ 지연 작업 테스트 (3초 후 실행)...');

  const result = await sendRequest('/bull/delayed', 'POST', {
    name: 'notification',
    data: { userId: 999, message: 'Delayed notification' },
    delayMs: 3000,
  });

  console.log('Delayed job added:', result.data);
  console.log('   (3초 후 실행 예정)');
}

async function testConcurrentJobs(): Promise<void> {
  console.log('\n🚀 동시 작업 테스트 (5개 작업)...');

  const promises = [];
  const startTime = Date.now();

  for (let i = 1; i <= 5; i++) {
    promises.push(
      sendRequest('/bull/email', 'POST', {
        to: `user${i}@example.com`,
        subject: `Concurrent Test ${i}`,
        body: `Message ${i}`,
      }),
    );
  }

  const results = await Promise.all(promises);
  console.log(`5개 작업 큐 등록 완료 (${Date.now() - startTime}ms)`);

  // 모든 작업 완료 대기
  const jobIds = results.map((r) => r.data?.jobId).filter(Boolean) as string[];
  console.log('Job IDs:', jobIds);

  console.log('작업 완료 대기 중...');
  for (const jobId of jobIds) {
    await waitForJobCompletion(jobId);
  }

  const totalTime = Date.now() - startTime;
  console.log(`✅ 모든 작업 완료 (총 ${totalTime}ms)`);
}

async function testQueueControl(): Promise<void> {
  console.log('\n🎛️ 큐 제어 테스트...');

  // 큐 일시정지
  console.log('큐 일시정지...');
  await sendRequest('/bull/pause', 'POST');

  // 작업 추가 (대기 상태로)
  const result = await sendRequest('/bull/notification', 'POST', {
    userId: 1,
    message: 'Paused queue test',
  });
  console.log('작업 추가됨 (큐 일시정지 상태):', result.data?.jobId);

  await checkQueueStatus();

  // 큐 재개
  console.log('큐 재개...');
  await sendRequest('/bull/resume', 'POST');

  if (result.data?.jobId) {
    const finalStatus = await waitForJobCompletion(result.data.jobId);
    console.log('✅ 큐 재개 후 작업 완료:', finalStatus.data?.state);
  }
}

async function runAllTests(): Promise<void> {
  console.log('🧪 BullMQ 테스트 시작');
  console.log('='.repeat(50));
  console.log(`API Base: ${API_BASE}`);

  try {
    // 초기 상태 확인
    await checkQueueStatus();

    // 개별 작업 테스트
    await testEmailJob();
    await testNotificationJob();
    await testDataProcessingJob();

    // 지연 작업 테스트
    await testDelayedJob();

    // 동시 작업 테스트
    await testConcurrentJobs();

    // 큐 제어 테스트
    await testQueueControl();

    // 최종 상태 확인
    await checkQueueStatus();

    // 정리
    console.log('\n🧹 완료된 작업 정리...');
    const cleanResult = await sendRequest('/bull/clean', 'POST');
    console.log('Cleaned:', cleanResult.data);

    console.log('\n' + '='.repeat(50));
    console.log('✅ 모든 테스트 완료!');
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  }
}

runAllTests();
