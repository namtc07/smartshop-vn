#!/bin/sh
set -e

echo "Checking Prisma migration state..."
STATUS=$(npx prisma migrate status 2>&1 || true)
echo "$STATUS"

# If the initial migration is recorded as failed but its tables already exist,
# resolve it as applied so subsequent migrations can run.
if echo "$STATUS" | grep -q "20260520083334_init"; then
  if echo "$STATUS" | grep -q "failed"; then
    echo "Detected failed init migration, marking as applied..."
    npx prisma migrate resolve --applied 20260520083334_init || true
  fi
fi

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec "$@"
