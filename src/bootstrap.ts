import env from "./config/env";
import logger from "./utils/logger";

export async function bootstrap(): Promise<void> {
  logger.info(
    `${env.app.name} is bootstrapping...`
  );

  logger.info(
    `Environment: ${env.app.env}`
  );

  logger.info(
    `Default Provider: ${env.ai.defaultProvider}`
  );

  logger.info(
    `Default Model: ${env.ai.defaultModel}`
  );
}
