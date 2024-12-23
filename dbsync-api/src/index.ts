process.env.ELASTIC_APM_SERVICE_NAME='cardano-dbsync-api'
process.env.ELASTIC_APM_ENVIRONMENT=process.env.ELASTIC_APM_ENVIRONMENT || 'local'
process.env.ELASTIC_APM_LOG_LEVEL='warning'
import { configDotenv } from 'dotenv'
configDotenv()
import * as agent from 'elastic-apm-node/start'; agent;
import express, { Request, Response } from "express";
import http from "http";
import stakeAddrRoute from "./controllers/stakeAddress";
import delegationRoute from "./controllers/delegation";
import drepRoute from "./controllers/drep";
import addressRoute from "./controllers/address";
import proposalRoute from "./controllers/proposal";
import healthCheckRoute from "./health/healthCheck"
import { errorHandler } from "./errors/AppError";
import path from "path";
import setupSwaggerUi from "./swagger-loader";
import fs from "fs";
import { prisma } from "./config/db";

const app = express();

const dynamicCors = (req:Request, res:Response, next:any) => {
    const origin = req.headers.origin
  
    // Allow requests from any origin but with credentials
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
  
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  };
app.use(express.static(path.resolve('.')));

if (process.env.CORS_ENABLE){
    app.use(dynamicCors);
}

// Middleware
app.use(express.json());

// Order Routes
app.use('/api/delegation',delegationRoute);
app.use('/api/stake-address', stakeAddrRoute);
app.use('/api/drep',drepRoute)
app.use('/api/address',addressRoute)
app.use('/api/proposal',proposalRoute)
app.use('/api/health', healthCheckRoute)

setupSwaggerUi(app)
const indexFile = path.resolve('.','./index.html')
// Check if index.html exists
fs.access(indexFile, fs.constants.F_OK, (err) => {
  if (!err) {
    // If index.html exists, define the catch-all handler
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(indexFile);
    });
  } else {
    console.error('index.html does not exist.');
  }
});
app.use(errorHandler); 



// Create HTTP server
const server = http.createServer(app);


// Start the server
const port = process.env.PORT || 8080;
console.log("Connecting to database")
prisma.$connect().then(()=>{
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
}).catch(e=>{
  console.error("Database conn failed",e)
})




