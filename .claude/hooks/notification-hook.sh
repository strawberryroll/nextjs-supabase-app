#!/bin/bash
# Notification 훅: permission_prompt 발생 시 Slack 알림 전송
# stdin = Claude Code가 전달하는 JSON (hook_event_name, message, cwd 등)

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
MESSAGE=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('message','권한 승인이 필요합니다'))" 2>/dev/null)

curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \":bell: *Claude Code 권한 요청*\n프로젝트: \`$PROJECT\`\n$MESSAGE\"}" > /dev/null

exit 0
