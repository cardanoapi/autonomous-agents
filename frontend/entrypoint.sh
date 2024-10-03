#!/bin/sh
if [ -n "$ELASTIC_APM_SERVER_URL" ] && [ -n "$ELASTIC_APM_SERVICE_NAME" ] && [ -n "$ELASTIC_APM_API_KEY" ]; then
    export NODE_OPTIONS=--require=elastic-apm-node/start-next.js
    echo "Configured APM service for host: $ELASTIC_APM_SERVER_URL"
else
    if [ -n "$ELASTIC_APM_SERVER_URL" ] || [ -n "$ELASTIC_APM_SERVICE_NAME" ] || [ -n "$ELASTIC_APM_API_KEY" ]; then
        MISSING=""
        if [ -z "$ELASTIC_APM_SERVER_URL" ]; then
            MISSING="ELASTIC_APM_SERVER_URL"
        fi

        if [ -z "$ELASTIC_APM_SERVICE_NAME" ]; then
            MISSING="$MISSING ELASTIC_APM_SERVICE_NAME"
        fi

        if [ -z "$ELASTIC_APM_API_KEY" ]; then
            MISSING="$MISSING ELASTIC_APM_API_KEY"
        fi
        echo "[WARN] APM Service partially configured. Missing: $MISSING" 1>&2
    fi
fi
exec "./node_modules/.bin/next" "start"
