#!/bin/bash

# Define the Python file and the function to check for
PYTHON_FILE="backend/app/helper/seed.py"
FUNCTION_NAME="seed_data"

# Check if the file exists
if [ ! -f "$PYTHON_FILE" ]; then
  echo "Python file $PYTHON_FILE not found!"
  exit 1
fi

# Check if the function exists in the Python file using grep
if grep -q "def $FUNCTION_NAME" "$PYTHON_FILE"; then
  echo "Function $FUNCTION_NAME found in $PYTHON_FILE. Running script..."
  python3 "$PYTHON_FILE"
else
  echo "Function $FUNCTION_NAME not found in $PYTHON_FILE. Exiting..."
  exit 1
fi
