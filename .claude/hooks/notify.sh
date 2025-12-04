#!/usr/bin/env bash
set -euo pipefail
title="${1:-Claude Code}"
message="${2:-Notification}"
if [[ "$OSTYPE" == darwin* ]]; then
  /usr/bin/osascript -e "display notification \"$message\" with title \"$title\""
elif command -v notify-send >/dev/null 2>&1; then
  notify-send "$title" "$message"
else
  printf '[%s] %s\n' "$title" "$message"
fi