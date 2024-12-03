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
      return res.status(500).json({
        message:
          "Unable to retrieve the latest block information from the database.",
      });
    }

    const latestBlockTime = latestBlock.time.toISOString();
    const timeDiff = secondsSince(latestBlockTime);

    if (timeDiff > 300) {
      return res.status(503).json({
        status: "Service Unavailable",
        details: {
          currentTime: new Date().toISOString(),
          latestBlockTime,
          secondsSinceLastUpdate: timeDiff,
        },
      });
    }

    return res.status(200).json({
      status: "Healthy",
      details: {
        currentTime: new Date().toISOString(),
        latestBlockTime,
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