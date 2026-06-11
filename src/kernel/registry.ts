export class Registry {
  private services = new Map<string, unknown>();

  register<T>(
    name: string,
    instance: T
  ): void {
    this.services.set(name, instance);
  }

  get<T>(
    name: string
  ): T | undefined {
    return this.services.get(name) as T;
  }

  has(name: string): boolean {
    return this.services.has(name);
  }
}

export const registry = new Registry();

export default registry;
