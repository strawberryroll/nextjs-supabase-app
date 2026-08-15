#!/bin/bash
# SessionStart 훅: 세션 시작 시간을 환경변수로 저장
# 이후 Stop hook에서 경과 시간 계산에 사용

if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo "export CLAUDE_SESSION_START=$(date +%s)" >> "$CLAUDE_ENV_FILE"
fi

exit 0
