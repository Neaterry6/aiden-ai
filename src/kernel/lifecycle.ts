import runtime from "./runtime";

export function markReady(): void {
  runtime.ready = true;
}

export function markMaintenance(
  value: boolean
): void {
  runtime.maintenance = value;
}
