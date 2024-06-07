"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveTriggerHistory = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const luxon_1 = require("luxon");
const prisma = new client_1.PrismaClient();
async function saveTriggerHistory(agentId, functionName, status, success, message) {
    try {
        const triggerHistory = {};
        triggerHistory["id"] = (0, uuid_1.v4)();
        triggerHistory["agentId"] = agentId;
        triggerHistory["functionName"] = functionName;
        triggerHistory["status"] = status;
        triggerHistory["success"] = success;
        triggerHistory["message"] = message;
        triggerHistory["timestamp"] = luxon_1.DateTime.utc().toISO();
        await prisma.triggerHistory.create({
            data: triggerHistory,
        });
    }
    catch (error) {
        console.log(`Error : ${error}`);
    }
}
exports.saveTriggerHistory = saveTriggerHistory;
