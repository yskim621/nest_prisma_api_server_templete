/**
 * RabbitMQ Queue Load Test
 *
 * 여러 메시지를 동시에 큐에 추가하고 순차적으로 처리되는지 확인
 *
 * 실행 방법:
 * npx ts-node test/queue-load-test.ts
 */
export {};

const API_URL = 'http://localhost:4010';
const TOTAL_MESSAGES = 10;

interface ApiResponse {
  code: string;
  isSuccess: boolean;
  message: string;
  data: {
    success: boolean;
    message: string;
    data: {
      id: string;
      type: string;
      payload: any;
      timestamp: string;
    };
  };
}

async function sendEmailJob(index: number): Promise<void> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_URL}/queue/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: `user${index}@example.com`,
        subject: `Test Email #${index}`,
        body: `This is test message number ${index}`,
      }),
    });

    const result: ApiResponse = await response.json();
    const duration = Date.now() - startTime;

    if (result.isSuccess && result.data?.success) {
      console.log(`[${new Date().toISOString()}] ✅ Email #${index} queued (${duration}ms) - ID: ${result.data.data.id}`);
    } else {
      console.log(`[${new Date().toISOString()}] ❌ Email #${index} failed (${duration}ms) - ${result.message}`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Email #${index} error:`, error);
  }
}

async function sendNotificationJob(index: number): Promise<void> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_URL}/queue/notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: index,
        message: `Notification for user ${index}`,
      }),
    });

    const result: ApiResponse = await response.json();
    const duration = Date.now() - startTime;

    if (result.isSuccess && result.data?.success) {
      console.log(`[${new Date().toISOString()}] ✅ Notification #${index} queued (${duration}ms) - ID: ${result.data.data.id}`);
    } else {
      console.log(`[${new Date().toISOString()}] ❌ Notification #${index} failed (${duration}ms) - ${result.message}`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Notification #${index} error:`, error);
  }
}

async function getQueueStatus(): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/queue/status`);
    const result: ApiResponse = await response.json();
    console.log('\n📊 Queue Status:', result.data?.data || result.data);
  } catch (error) {
    console.error('Failed to get queue status:', error);
  }
}

async function runLoadTest(): Promise<void> {
  console.log('='.repeat(60));
  console.log('🚀 RabbitMQ Queue Load Test Started');
  console.log(`📨 Sending ${TOTAL_MESSAGES} messages...`);
  console.log('='.repeat(60));

  // 초기 큐 상태 확인
  await getQueueStatus();

  console.log('\n--- Sending Messages (Concurrent) ---\n');

  const startTime = Date.now();

  // 동시에 여러 메시지 전송
  const promises: Promise<void>[] = [];
  for (let i = 1; i <= TOTAL_MESSAGES; i++) {
    // 이메일과 알림을 번갈아 전송
    if (i % 2 === 0) {
      promises.push(sendEmailJob(i));
    } else {
      promises.push(sendNotificationJob(i));
    }
  }

  await Promise.all(promises);

  const totalDuration = Date.now() - startTime;
  console.log(`\n✅ All ${TOTAL_MESSAGES} messages sent in ${totalDuration}ms`);

  // 잠시 대기 후 큐 상태 확인
  await new Promise((resolve) => setTimeout(resolve, 500));
  await getQueueStatus();

  console.log('\n' + '='.repeat(60));
  console.log('📋 Check Docker logs to see message processing:');
  console.log('   docker logs -f nest-api-dev');
  console.log('='.repeat(60));
}

// 실행
runLoadTest().catch(console.error);
