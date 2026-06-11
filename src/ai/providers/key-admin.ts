import { keyManager } from "./key-manager";
import logger from "../../utils/logger";

export class KeyAdmin {
  add(provider: string, key: string) {
    keyManager.addKey(provider, key);
  }

  remove(provider: string, key: string) {
    const list = keyManager.list(provider);

    const filtered = list.filter((k) => k.key !== key);

    // reset pool (simple safe overwrite)
    (keyManager as any).keys.set(provider, filtered);

    logger.warn(`Key removed for ${provider}`);
  }

  list(provider: string) {
    return keyManager.list(provider);
  }
}

export const keyAdmin = new KeyAdmin();
