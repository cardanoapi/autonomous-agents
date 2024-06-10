#!/bin/bash

# Run commands within the swarmed shell from Poetry
poetry run sh <<EOF
    python -m uvicorn backend.app:get_application --host 0.0.0.0 --port 8000 --reload
EOF