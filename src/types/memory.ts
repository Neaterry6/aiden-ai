export type MemoryScope =
  | "GLOBAL"
  | "USER"
  | "GROUP"
  | "PRIVATE";

export interface MemoryRecord {
  id: string;

  scope: MemoryScope;

  key: string;

  value: string;

  createdAt: number;
  updatedAt: number;
}
