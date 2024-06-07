#!/bin/bash
poetry shell

black --check .
if [ $? -eq 0 ]; then
    echo "Files are properly formatted."
else
    echo "Files are not properly formatted."
    exit 1
fi