-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('CRON', 'TOPIC');

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instance" BIGINT NOT NULL,
    "template_id" TEXT NOT NULL,
    "index" BIGSERIAL NOT NULL,
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
    "action" JSONB NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Trigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template_Trigger" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "type" "TriggerType" NOT NULL,
    "action" JSONB NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Template_Trigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriggerHistory" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "success" BOOLEAN NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3),
    "txHash" TEXT,

    CONSTRAINT "TriggerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionDetail" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "running" BOOLEAN NOT NULL,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FunctionDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FunctionDetail_name_key" ON "FunctionDetail"("name");
