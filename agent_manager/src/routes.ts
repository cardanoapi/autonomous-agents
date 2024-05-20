import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import swagger from "./swagger";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TriggerResults
 *   description: Operations related to trigger results
 */

/**
 * @swagger
 * /api/trigger-history/agent/{agentId}:
 *   get:
 *     summary: Retrieve trigger results for a specific agent
 *     description: Get trigger results for a specific agent by ID.
 *     tags: [TriggerResults]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         description: ID of the agent
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Trigger results for the specified agent
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       '404':
 *         description: Agent not found
 */
router.get('/api/trigger-history/agent/:agentId', async (req: Request, res: Response) => {
  const { agentId } = req.params;

  try {
    const results = await prisma.triggerHistory.findMany({
      where: { agentId: agentId },
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Agent not found, 404 Error' });
  }
});

/**
 * @swagger
 * /api/trigger-history:
 *   get:
 *     summary: Retrieve all trigger results
 *     description: Get a list of all trigger results.
 *     tags: [TriggerResults]
 *     responses:
 *       '200':
 *         description: A list of trigger results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/api/trigger-history', async (req: Request, res: Response) => {
  try {
    const results = await prisma.triggerHistory.findMany();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trigger results' });
  }
});

/**
 * @swagger
 * /api/trigger-history/function/{functionName}:
 *   get:
 *     summary: Retrieve trigger results for a function
 *     description: Get trigger results for a function
 *     tags: [TriggerResults]
 *     parameters:
 *       - in: path
 *         name: functionName
 *         required: true
 *         description: Function name
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Trigger results for the specified function
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       '404':
 *         description: Function not found
 */
router.get('/api/trigger-history/function/:functionName', async (req: Request, res: Response) => {
  const { functionName } = req.params;

  console.log(`Received request to fetch trigger history for function name: ${functionName}`);

  try {
    const results = await prisma.triggerHistory.findMany({
      where: { functionName: functionName },
    });

    if (results.length === 0) {
      return res.status(404).json({ error: `No trigger history found for function name: ${functionName}` });
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching trigger history:', error);
    res.status(500).json({ error: 'Function does not exist, Please try again' });
  }
});



/**
 * @swagger
 * /api/function-details:
 *   get:
 *     summary: Returns the list of all function details
 *     tags: [FunctionDetail]
 *     responses:
 *       200:
 *         description: The list of function details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/api/function-details', async (req: Request, res: Response) => {
  try {
    const functionDetails = await prisma.functionDetail.findMany();
    res.json(functionDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch function details' });
  }
});

export default router;
