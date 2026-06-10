#!/bin/sh
set -e

echo "Running migrations..."
bin/backend eval 'Backend.Release.migrate()'

echo "Running seeds..."
bin/backend eval 'Backend.Release.seed()'

echo "Starting backend..."
exec bin/backend start
