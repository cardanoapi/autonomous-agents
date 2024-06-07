#!/bin/bash

# Check if .git directory exists in the current directory
if [ -d ".git" ]; then
  echo ".git directory exists."

  # Check if pre-commit.sh exists in .git/hooks
  if [ ! -f ".git/hooks/pre-commit" ]; then
    echo "pre-commit does not exist in .git/hooks. Copying from /hooks/pre-commit.sh..."
    
    # Check if the source pre-commit.sh exists
    if [ -f "./hooks/pre-commit.sh" ]; then
      cp ./hooks/pre-commit.sh .git/hooks/pre-commit
      echo "pre-commit has been copied to .git/hooks."
    else
      echo "Source file /hooks/pre-commit.sh does not exist. Cannot copy."
    fi
  else
    echo "pre-commit.sh already exists in .git/hooks."
  fi
else
  echo ".git directory does not exist in the current directory.Not a git repository"
fi
