#!/bin/bash

# RabbitMQ Queue Load Test (Bash)
# 여러 메시지를 동시에 큐에 추가하고 순차적으로 처리되는지 확인

API_URL="http://localhost:4010"
TOTAL_MESSAGES=10

echo "========================================"
echo "🚀 RabbitMQ Queue Load Test"
echo "📨 Sending $TOTAL_MESSAGES messages..."
echo "========================================"

# 큐 상태 확인
echo ""
echo "📊 Initial Queue Status:"
curl -s "$API_URL/queue/status" | jq .
echo ""

echo "--- Sending Messages ---"
echo ""

# 동시에 메시지 전송 (백그라운드)
for i in $(seq 1 $TOTAL_MESSAGES); do
  (
    if [ $((i % 2)) -eq 0 ]; then
      # 이메일 작업
      result=$(curl -s -X POST "$API_URL/queue/email" \
        -H "Content-Type: application/json" \
        -d "{\"to\": \"user$i@example.com\", \"subject\": \"Test Email #$i\", \"body\": \"Message $i\"}")
      echo "[$(date +%H:%M:%S.%3N)] ✅ Email #$i queued"
    else
      # 알림 작업
      result=$(curl -s -X POST "$API_URL/queue/notification" \
        -H "Content-Type: application/json" \
        -d "{\"userId\": $i, \"message\": \"Notification $i\"}")
      echo "[$(date +%H:%M:%S.%3N)] ✅ Notification #$i queued"
    fi
  ) &
done

# 모든 백그라운드 작업 대기
wait

echo ""
echo "✅ All messages sent!"
echo ""

# 큐 상태 확인
echo "📊 Final Queue Status:"
curl -s "$API_URL/queue/status" | jq .

echo ""
echo "========================================"
echo "📋 Check Docker logs to see processing:"
echo "   docker logs -f nest-api-dev"
echo "========================================"
