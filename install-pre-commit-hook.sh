#!/bin/bash

# Check if .git directory exists in the current directory
if [ -d ".git" ]; then
  echo ".git directory exists."

  # Check if pre-commit.sh exists in .git/hooks
  if [ -f ".git/hooks/pre-commit" ]; then
    echo "pre-commit.sh already exists in .git/hooks. Checking if it needs to be replaced..."
    
    # Check if the source pre-commit.sh exists
    if [ -f "./hooks/pre-commit.sh" ]; then
      # Compare the contents of the existing pre-commit and the source pre-commit.sh
      if cmp -s "./hooks/pre-commit.sh" ".git/hooks/pre-commit"; then
        echo "pre-commit.sh in .git/hooks is identical. No need to replace."
      else
        cp "./hooks/pre-commit.sh" ".git/hooks/pre-commit"
        echo "pre-commit.sh has been replaced in .git/hooks."
      fi
    else
      echo "Source file ./hooks/pre-commit.sh does not exist. Cannot replace."
    fi
  else
    echo "pre-commit does not exist in .git/hooks. Copying from ./hooks/pre-commit.sh..."
    
    # Check if the source pre-commit.sh exists
    if [ -f "./hooks/pre-commit.sh" ]; then
      cp "./hooks/pre-commit.sh" ".git/hooks/pre-commit"
      echo "pre-commit.sh has been copied to .git/hooks."
    else
      echo "Source file ./hooks/pre-commit.sh does not exist. Cannot copy."
    fi
  fi
else
  echo ".git directory does not exist in the current directory. Not a git repository."
fi
