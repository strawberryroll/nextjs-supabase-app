#!/bin/bash
# PreToolUse 훅: 보호 대상 파일에 대한 Edit/Write 차단
# stdin = Claude Code가 전달하는 JSON (tool_input.file_path 포함)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null)
NAME=$(basename "$FILE_PATH")

PROTECTED=(".env" "package-lock.json" "pnpm-lock.yaml")
for pattern in "${PROTECTED[@]}"; do
  if [[ "$NAME" == $pattern ]]; then
    echo "보호된 파일입니다: $NAME" >&2
    exit 2
  fi
done

# .env.* 패턴 별도 처리
if [[ "$NAME" == .env.* ]]; then
  echo "보호된 파일입니다: $NAME" >&2
  exit 2
fi

exit 0
