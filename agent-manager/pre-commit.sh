#!/bin/sh

# Run Prettier check
echo "Running Prettier format check..."
yarn format:check

# Capture the exit status of the Prettier check
PRETTIER_STATUS=$?

# Run ESLint check
echo "Running ESLint lint check..."
yarn lint:check

# Capture the exit status of the ESLint check
ESLINT_STATUS=$?

# Determine the overall status
if [ $PRETTIER_STATUS -ne 0 ] || [ $ESLINT_STATUS -ne 0 ]; then
  echo "One or both checks failed."
  if [ $PRETTIER_STATUS -ne 0 ]; then
    echo "Prettier check failed."
  fi
  if [ $ESLINT_STATUS -ne 0 ]; then
    echo "ESLint check failed."
  fi
  exit 1
else
  echo "All checks passed successfully."
  exit 0
fi
