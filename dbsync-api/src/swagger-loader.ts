import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";

// Define a TypeScript interface for your configuration
interface Config {
  appName: string;
  version: string;
  settings: {
    port: number;
    environment: string;
  };
}

// Function to load YAML configuration
function loadConfig(filePath: string): Config {
  try {
    // Read the YAML file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // Parse the YAML content
    return yaml.load(fileContent) as Config;
  } catch (e) {
    throw e;
  }
}
const yamlPath = path.join('.', 'swagger.yaml');




export default function setupSwaggerUi(app:any){
  try{
     let swaggerDoc = loadConfig(yamlPath);
     app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
    }
    catch(e:any){
    }
}