#!/bin/bash

# Run commands within the swarmed shell from Poetry
poetry run sh -c '
  # Run Black to check formatting
  black --check .
  STATUS=$?

  # Check the exit code of the previous command
  if [ $STATUS -eq 0 ]; then
      echo "Files are properly formatted."
  else
      echo "Files are not properly formatted."
      exit 1
  fi
'
