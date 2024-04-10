-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('CRON', 'TOPIC');

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "action" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instance" BIGINT NOT NULL,
    "last_active" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trigger" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "type" "TriggerType" NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Trigger_pkey" PRIMARY KEY ("id")
);
