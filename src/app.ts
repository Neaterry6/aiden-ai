import { bootstrap } from "./bootstrap";
import logger from "./utils/logger";

async function main(): Promise<void> {
  try {
    await bootstrap();
  } catch (error) {
    logger.error(
      "Fatal startup error:",
      error
    );

    process.exit(1);
  }
}

void main();
