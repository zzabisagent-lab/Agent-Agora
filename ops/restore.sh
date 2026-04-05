#!/usr/bin/env bash
# AgentAgora MongoDB restore script
# Usage: ./ops/restore.sh <backup_file.tar.gz>

set -euo pipefail

if [[ -z "${1:-}" ]]; then
  echo "Usage: $0 <backup_file.tar.gz>"
  exit 1
fi

BACKUP_FILE="$1"
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017/agentagora}"
TMP_DIR=$(mktemp -d)

echo "[restore] Extracting $BACKUP_FILE to $TMP_DIR ..."
tar -xzf "$BACKUP_FILE" -C "$TMP_DIR"

DUMP_DIR=$(find "$TMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -1)
if [[ -z "$DUMP_DIR" ]]; then
  echo "[restore] ERROR: no dump directory found in archive"
  rm -rf "$TMP_DIR"
  exit 1
fi

echo "[restore] Restoring from $DUMP_DIR ..."
mongorestore --uri="$MONGO_URI" --gzip --drop "$DUMP_DIR"

rm -rf "$TMP_DIR"

echo "[restore] Smoke test: checking collections ..."
mongosh "$MONGO_URI" --quiet --eval "
  const db = db.getSiblingDB('agentagora');
  const cols = db.listCollectionNames();
  if (!cols.includes('humanusers') || !cols.includes('posts')) {
    throw new Error('Missing expected collections: ' + cols);
  }
  print('[restore] OK — collections found: ' + cols.join(', '));
"

echo "[restore] Done."
