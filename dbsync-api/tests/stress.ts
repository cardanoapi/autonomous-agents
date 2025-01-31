const axios = require('axios');
const { performance } = require('perf_hooks');

// Constants
const TIMEOUT = 60000; // 60 seconds timeout
const PAGE_SIZE = 200; // Number of items per page
const NUM_INSTANCES = 3; // Number of parallel instances
const REPORT_INTERVAL = 10000; // Report metrics every 10 seconds

let requestCounter = 0;
let totalRequests = 0;
let failedRequests = 0;
let responseTimes = [];

// Function to fetch the list of drep items
const fetchDrepList = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/drep?page=1&size=${PAGE_SIZE}`, {
      headers: { accept: 'application/json' },
    });
    return response.data.items;
  } catch (error) {
    console.error('Error fetching drep list:', error);
    return [];
  }
};

// Function to fetch details of a single drep with a timeout
const fetchDrepDetailsWithTimeout = async (drepId) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), TIMEOUT)
  );
  const requestPromise = axios.get(`http://localhost:8080/api/drep/${drepId}`, {
    headers: { accept: 'application/json' },
  });

  try {
    const response = await Promise.race([requestPromise, timeoutPromise]);
    return response.data;
  } catch (error) {
    return { error: 'timeout' };
  }
};

// Function to calculate the median
const calculateMedian = (arr) => {
  if (arr.length === 0) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

// Function to print metrics
const printMetrics = () => {
  const totalTime = responseTimes.reduce((acc, time) => acc + time, 0);
  const averageTime = responseTimes.length > 0 ? totalTime / responseTimes.length : 0;
  const minTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
  const maxTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
  const medianTime = calculateMedian(responseTimes);

  console.log(`\nMetrics Report:`);
  console.log(`  Total Requests: ${totalRequests}`);
  console.log(`  Failed Requests: ${failedRequests}`);
  console.log(`  Average Response Time: ${averageTime.toFixed(2)} ms`);
  console.log(`  Median Response Time: ${medianTime.toFixed(2)} ms`);
  console.log(`  Max Response Time: ${maxTime.toFixed(2)} ms`);
  console.log(`  Min Response Time: ${minTime.toFixed(2)} ms`);
  console.log('-----------------------------------');
};

// Function to fetch all drep details continuously
const fetchAllDrepDetailsContinuously = async (instanceId) => {
  while (true) {
    try {
      const drepList = await fetchDrepList();
      if (drepList.length === 0) {
        console.log(`[Instance ${instanceId}] No drep items found, retrying...`);
        continue;
      }

      const detailPromises = drepList.map(async (drep) => {
        const myCounter = requestCounter++;
        console.log(`[Instance ${instanceId}] Request #${myCounter} for drepId: ${drep.drepId}`);

        const startTime = performance.now();
        const result = await fetchDrepDetailsWithTimeout(drep.drepId);
        const elapsedTime = performance.now() - startTime;

        if (result.error) {
          failedRequests++;
        } else {
          responseTimes.push(elapsedTime);
        }

        console.log(
          `[Instance ${instanceId}] Request #${myCounter} completed for drepId: ${drep.drepId} (Time: ${elapsedTime.toFixed(2)}ms)`
        );
      });

      await Promise.all(detailPromises);
      totalRequests += drepList.length;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`[Instance ${instanceId}] Error during request processing:`, error);
    }
  }
};

// Function to run multiple instances
const startInstances = () => {
  for (let i = 1; i <= NUM_INSTANCES; i++) {
    fetchAllDrepDetailsContinuously(i);
  }
};

// Function to periodically report metrics
const startMetricsReporter = () => {
  setInterval(printMetrics, REPORT_INTERVAL);
};

// Start parallel instances and the metrics reporter
startInstances();
startMetricsReporter();
