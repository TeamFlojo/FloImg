#!/bin/bash
# Pre-commit hook for imgflo (OSS)
# Validates code quality before commits

set -e

echo "Running pre-commit checks..."

# Check for staged TypeScript files
STAGED_TS=$(git diff --cached --name-only | grep -E '\.tsx?$' || true)

if [ -n "$STAGED_TS" ]; then
    echo "Checking TypeScript..."
    pnpm -r run typecheck || {
        echo "TypeScript check failed. Fix type errors before committing."
        exit 1
    }
fi

# Check for debugger statements
if git diff --cached | grep -E '^\+.*debugger'; then
    echo "ERROR: Remove debugger statements before committing"
    exit 1
fi

# Check for console.log (warning only)
if git diff --cached | grep -E '^\+.*console\.log'; then
    echo "WARNING: console.log statements found. Consider removing for production."
fi

# Check for merge conflict markers
if git diff --cached | grep -E '^\+.*(<<<<<<<|=======|>>>>>>>)'; then
    echo "ERROR: Merge conflict markers found"
    exit 1
fi

# Check for temporal language in evergreen vault docs
STAGED_EVERGREEN=$(git diff --cached --name-only | grep -E 'vault/(architecture|product)/.*\.md$' || true)

if [ -n "$STAGED_EVERGREEN" ]; then
    echo "Checking evergreen docs for temporal language..."
    for file in $STAGED_EVERGREEN; do
        if [ -f "$file" ]; then
            # Check for temporal words (case insensitive)
            if grep -inE '\b(will|going to|recently|soon|currently|now we)\b' "$file" | grep -v '^#'; then
                echo "ERROR: Temporal language found in evergreen doc: $file"
                echo "Evergreen docs should use timeless language."
                exit 1
            fi
        fi
    done
fi

echo "Pre-commit checks passed!"
