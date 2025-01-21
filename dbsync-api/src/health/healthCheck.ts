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
    });
  } catch (error: any) {
    console.log(`Error performing health-check: ${error.message || error}`);

    return res.status(500).json({
      message: "An error occurred while checking the DbSync status.",
    });
  }
};

router.get("/", handlerWrapper(getBlockInfo));

export default router;
