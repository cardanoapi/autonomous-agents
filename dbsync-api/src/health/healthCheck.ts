import { Request, Response, Router } from "express";
import { prisma } from "../config/db";
import { handlerWrapper } from "../errors/AppError";

const router = Router();

export const secondsSince = (
  dateIsoString: string,
  inMilliseconds?: boolean
): number => {
  const parsedDate = new Date(dateIsoString);
  const currentDate = new Date();
  const timeDifferenceMs = currentDate.getTime() - parsedDate.getTime();
  return inMilliseconds ? timeDifferenceMs : timeDifferenceMs / 1000;
};

const getBlockInfo = async (req: Request, res: Response) => {
  const metrics=await prisma.$metrics.json()
  const gauges:Record<string,any>={}
  metrics.gauges.forEach(g=>{gauges[g.key.replace('prisma_','')]=g.value})

  try {
    const latestBlock = await prisma.block.findFirst({
      orderBy: {
        time: "desc",
      },
    });

    if (!latestBlock) {
      console.log("Unable to retrieve the latest block information from the database.");
      return res.status(500).json({
        message:
          "Unable to retrieve the latest block information from the database.",
      });
    }
    
    const blockInfo = {
      blockHash: latestBlock.hash.toString("hex"),
      blockNo: latestBlock.block_no,
      slotNo: latestBlock.slot_no?.toString(),
      blockTime: latestBlock.time.toISOString(),
    };
    const timeDiff = secondsSince(blockInfo.blockTime);

    if (timeDiff > 300) {
      const body = {
        status: "Service Unavailable",
        details: {
          ...blockInfo,
          currentTime: new Date().toISOString(),
          secondsSinceLastUpdate: timeDiff,
        },
        metrics:gauges

      }
      console.log(`DbSync BlockTimeDifferenceError: ${body}`);
      return res.status(503).json(body);
    }


    return res.status(200).json({
      status: "Healthy",
      details: {
        ...blockInfo,
        currentTime: new Date().toISOString(),
        secondsSinceLastUpdate: timeDiff,
      },
      metrics:gauges

    });
  } catch (error: any) {
    console.log(`Error performing health-check: ${error?.message || error}`);

    return res.status(500).json({
      message: "An error occurred while checking the DbSync status.",
      metrics:gauges

    });
  }
};
const getDbMetrics = async (req: Request, res: Response) => {
  return res.status(200).json(await prisma.$metrics.json())
}
const prometheusMetrics = async (req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  return res.status(200).send(await prisma.$metrics.prometheus())
}

router.get('/db',handlerWrapper(getDbMetrics))
router.get('/prometheus',handlerWrapper(prometheusMetrics))

router.get("/", handlerWrapper(getBlockInfo));

export default router;
