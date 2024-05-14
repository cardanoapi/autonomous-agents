# Stage 1: Generate requirements.txt (builder)
FROM python:3.12.2-slim AS builder

# Set working directory
WORKDIR /tmp

# Install Poetry
RUN pip install poetry==1.8.2

#
COPY ./pyproject.toml ./poetry.lock* /tmp/

# Generate requirements.txt
RUN poetry export -f requirements.txt --without-hashes -o requirements.txt

# Stage 2: Final image (slim)
FROM python:3.12.2-slim

# Configure environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONHASHSEED=0 \
    SOURCE_DATE_EPOCH=315532800 \
    CFLAGS=-g0 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=800 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    POETRY_VERSION=1.8.2 \
    POETRY_INSTALL_OPTS="--no-interaction --without dev --no-root" \
    PYSETUP_PATH="/api/backend" \
    VENV_PATH="/api/backend/.venv"

ENV PATH="${POETRY_HOME}/bin:${VENV_PATH}/bin:${PATH}"

# Set working directory
WORKDIR /api
COPY . ./backend

WORKDIR $PYSETUP_PATH

# Copy requirements.txt from builder stage
COPY --from=builder /tmp/requirements.txt $PYSETUP_PATH

# Install dependencies from requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt


RUN prisma generate
EXPOSE 8000/tcp
HEALTHCHECK CMD curl http://localhost:8000
CMD ["sh", "-c" ,"prisma migrate deploy && exec uvicorn backend.app:get_application --host 0.0.0.0 --port 8000"]
