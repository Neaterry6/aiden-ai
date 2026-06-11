export interface User {
  id: string;
  lid?: string;
  phone?: string;

  name?: string;
  pushName?: string;

  isOwner: boolean;
  isDeveloper: boolean;

  createdAt: number;
  updatedAt: number;
}
