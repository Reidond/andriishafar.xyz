#!/usr/bin/env bash
set -e

source /usr/local/share/runtime/devcontainer-features.env

exec runenv "${1:-local}" pnpm run dev --port $PORT --host
