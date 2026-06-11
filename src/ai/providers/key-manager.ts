import logger from "../../utils/logger";

export interface ProviderKey {
  key: string;

  active: boolean;

  usageCount: number;

  lastUsed: number;

  disabledUntil?: number;
}

export class KeyManager {
  private keys: Map<string, ProviderKey[]> = new Map();

  addKey(provider: string, key: string) {
    if (!this.keys.has(provider)) {
      this.keys.set(provider, []);
    }

    this.keys.get(provider)!.push({
      key,
      active: true,
      usageCount: 0,
      lastUsed: 0,
    });

    logger.info(`Key added for provider: ${provider}`);
  }

  getRandomKey(provider: string): string | null {
    const pool = this.keys.get(provider);

    if (!pool || pool.length === 0) {
      return null;
    }

    const available = pool.filter(
      (k) =>
        k.active &&
        (!k.disabledUntil || k.disabledUntil < Date.now())
    );

    if (available.length === 0) {
      return null;
    }

    const selected =
      available[Math.floor(Math.random() * available.length)];

    selected.usageCount++;
    selected.lastUsed = Date.now();

    return selected.key;
  }

  disableKey(provider: string, key: string, cooldownMs: number) {
    const pool = this.keys.get(provider);

    if (!pool) return;

    const target = pool.find((k) => k.key === key);

    if (!target) return;

    target.disabledUntil = Date.now() + cooldownMs;

    logger.warn(`Key rate-limited for ${provider}`);
  }

  list(provider: string) {
    return this.keys.get(provider) || [];
  }
}

export const keyManager = new KeyManager();
