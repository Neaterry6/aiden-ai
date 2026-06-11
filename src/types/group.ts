export interface Group {
  id: string;

  name: string;

  owner?: string;

  admins: string[];

  createdAt: number;
  updatedAt: number;
}
