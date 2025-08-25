#!/usr/bin/env bash
set -euo pipefail
SOUND="${1:-$HOME/.claude/sounds/notify.wav}"
have() { command -v "$1" >/dev/null 2>&1; }
if [[ "$OSTYPE" == darwin* ]]; then
  [[ -f "$SOUND" && -x /usr/bin/afplay ]] && /usr/bin/afplay "$SOUND" || printf '\a'
  exit 0
fi
if [[ "$OSTYPE" == linux* ]]; then
  [[ -f "$SOUND" && $(have paplay && echo 1) ]] && exec paplay "$SOUND"
  [[ -f "$SOUND" && $(have aplay && echo 1) ]] && exec aplay "$SOUND"
  [[ -f "$SOUND" && $(have play && echo 1) ]] && exec play -q "$SOUND"
  printf '\a'
  exit 0
fi
printf '\a'