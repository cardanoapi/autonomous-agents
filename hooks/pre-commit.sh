#!/bin/bash

# Define the folders to check for changes
folders=("agent-manager" "agent-node" "agent-python" "api" "frontend")

# Variable to track if any script fails
error_occurred=false


# Loop through each folder
for folder in "${folders[@]}"; do
    # Check if there are any staged changes in the folder
    changes=$(git diff --cached --name-only --exit-code "$folder")
    
    # Check if changes are detected
    if [ -n "$changes" ]; then
        echo "Changes detected in $folder. Executing pre-commit script..."
        # Execute the pre-commit script in the folder
        (cd "$folder" && ./pre-commit.sh)
        
        # Check the exit code of the pre-commit script
        if [ $? -ne 0 ]; then
            echo "Error occurred while executing pre-commit script in $folder."
            error_occurred=true
        fi
    else
        echo "No changes detected in $folder. Skipping pre-commit script execution."
    fi
done

# Exit with an error code if any script failed or changes are detected
if $error_occurred; then
    exit 1
fi
