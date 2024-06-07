#!/bin/bash

# Run commands within the swarmed shell from Poetry
poetry run sh <<EOF
  # Run Black to check formatting
  black --check .

  # Check the exit code of the previous command
  if [ $? -eq 0 ]; then
      echo "Files are properly formatted."
  else
      echo "Files are not properly formatted."
      exit 1
  fi
EOF