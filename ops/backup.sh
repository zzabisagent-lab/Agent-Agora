#!/usr/bin/env bash
# AgentAgora MongoDB backup script
# Keeps last 14 days of backups.
# Usage: ./ops/backup.sh [backup_dir]

set -euo pipefail

BACKUP_DIR="${1:-/var/backups/agentagora}"
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017/agentagora}"
RETENTION_DAYS=14
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEST="${BACKUP_DIR}/${TIMESTAMP}"

mkdir -p "$DEST"

echo "[backup] Starting dump to $DEST ..."
mongodump --uri="$MONGO_URI" --out="$DEST" --gzip

echo "[backup] Compressing ..."
tar -czf "${DEST}.tar.gz" -C "$BACKUP_DIR" "$TIMESTAMP"
rm -rf "$DEST"

echo "[backup] Removing backups older than ${RETENTION_DAYS} days ..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "[backup] Done: ${DEST}.tar.gz"
