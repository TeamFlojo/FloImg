#!/bin/bash
# Pre-compaction hook for imgflo
# Saves context before memory compaction

echo "Context compaction detected. Important context may be lost."
echo ""
echo "Consider using /w (wrap) to save session context before compaction."
echo ""
echo "Current task (from PROJECT_STATUS.md):"
grep -A 1 "Current Focus" PROJECT_STATUS.md 2>/dev/null || echo "No active task"
