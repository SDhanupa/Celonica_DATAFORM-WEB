#!/bin/bash
# ============================================================
# restore_db.sh — Combine 3 parts, decompress & restore to PostgreSQL
# Run from: /opt/celonica-web/  (after git pull)
# ============================================================

set -e
PARTS_DIR="db_parts"
MERGED_GZ="/tmp/celonica_full.sql.gz"
MERGED_SQL="/tmp/celonica_full.sql"

echo "=== Celonica DB Restore Script ==="
echo ""

# Step 1 — Combine the 3 parts back into one gz file
echo "[1/3] Combining parts..."
cat "$PARTS_DIR/celonica_db.part0" \
    "$PARTS_DIR/celonica_db.part1" \
    "$PARTS_DIR/celonica_db.part2" > "$MERGED_GZ"

SIZE=$(du -sh "$MERGED_GZ" | cut -f1)
echo "   Combined gz size: $SIZE"

# Step 2 — Decompress
echo ""
echo "[2/3] Decompressing..."
gunzip -f "$MERGED_GZ"
SQL_SIZE=$(du -sh "$MERGED_SQL" | cut -f1)
echo "   Decompressed size: $SQL_SIZE"

# Step 3 — Restore into PostgreSQL (running inside Docker)
echo ""
echo "[3/3] Restoring database..."

# Copy SQL into the postgres container
docker cp "$MERGED_SQL" celonica-web-postgres:/tmp/celonica_full.sql

# Restore (drops existing objects and re-creates)
docker compose exec -T db psql \
  -U celonica_user \
  -d celonica_db \
  -f /tmp/celonica_full.sql

echo ""
echo "✅ Database restore complete!"

# Cleanup temp files
rm -f "$MERGED_SQL"
docker compose exec -T db rm -f /tmp/celonica_full.sql
echo "   Temp files cleaned up."
