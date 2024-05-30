"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFunctionRunningStatus = exports.createOrUpdateFunctionDetail = exports.getFunctionDetail = void 0;
// src/repository/function_detail_repository.ts
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
const getFunctionDetail = async (name) => {
    return await prisma.functionDetail.findUnique({
        where: { name },
    });
};
exports.getFunctionDetail = getFunctionDetail;
const createOrUpdateFunctionDetail = async (functionName, running) => {
    await prisma.functionDetail.upsert({
        where: { name: functionName },
        update: {
            running: running,
            totalTransactions: {
                increment: 1,
            },
        },
        create: {
            id: (0, uuid_1.v4)(),
            name: functionName,
            running: running,
            totalTransactions: 1,
        },
    });
};
exports.createOrUpdateFunctionDetail = createOrUpdateFunctionDetail;
const updateFunctionRunningStatus = async (name, running) => {
    await prisma.functionDetail.update({
        where: { name: name },
        data: { running: running },
    });
};
exports.updateFunctionRunningStatus = updateFunctionRunningStatus;
