import dotenv from "dotenv";
import { existsSync } from "fs";
import path from "path";

const rootEnvPath = path.resolve(process.cwd(), "../.env");
const localEnvPath = path.resolve(process.cwd(), ".env");

if (existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else if (existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}
