#!/bin/bash
# Stop 훅: Claude 작업 완료 시 Slack 알림 전송
# stdin = Claude Code가 전달하는 JSON (hook_event_name, cwd 등)

ENV_FILE="${CLAUDE_PROJECT_DIR}/.env.local"
if [ -f "$ENV_FILE" ]; then
  export $(grep '^SLACK_WEBHOOK_URL=' "$ENV_FILE" | xargs)
fi

if [ -z "$SLACK_WEBHOOK_URL" ]; then
  exit 0
fi

INPUT=$(cat)
CWD=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('cwd',''))" 2>/dev/null)
PROJECT=$(basename "$CWD")

# 경과 시간 계산 (초 단위)
if [ -n "$CLAUDE_SESSION_START" ]; then
  NOW=$(date +%s)
  ELAPSED=$((NOW - CLAUDE_SESSION_START))

  # 60초(1분) 이상일 때만 알림 전송
  if [ $ELAPSED -ge 60 ]; then
    MINUTES=$((ELAPSED / 60))
    curl -s -X POST "$SLACK_WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"text\": \":white_check_mark: *Claude Code 작업 완료*\n프로젝트: \`$PROJECT\`\n소요 시간: ${MINUTES}분\"}" > /dev/null
  fi
else
  # 환경변수 없으면 알림 스킵 (첫 세션이거나 오류)
  exit 0
fi

exit 0
