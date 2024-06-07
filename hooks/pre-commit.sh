#!/bin/bash

# Define the folders to check for changes
folders=("agent-manager" "agent-node" "agent-python" "api" "frontend")

# Variable to track if any script fails
error_occurred=false

# Loop through each folder
for folder in "${folders[@]}"; do
    # Check if there are any changes in the folder
    if git diff --quiet --exit-code "$folder"; then
        echo "No changes detected in $folder. Skipping pre-commit script execution."
    else
        echo "Changes detected in $folder. Executing pre-commit script..."
        # Execute the pre-commit script in the folder
        (cd "$folder" && ./pre-commit)
        
        # Check the exit code of the pre-commit script
        if [ $? -ne 0 ]; then
            echo "Error occurred while executing pre-commit script in $folder."
            error_occurred=true
        fi
    fi
done

# Exit with an error code if any script failed
if $error_occurred; then
    exit 1
fi
