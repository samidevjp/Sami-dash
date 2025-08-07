import Dexie, { Table } from 'dexie';

export interface Order {
  id?: number;
  status: string;
  createdAt: number;
  products: any[];
  tableId?: number | null;
  employeeId?: number | null;
  guest?: any;
}

export class POSDB extends Dexie {
  orders!: Table<Order, number>;

  constructor() {
    super('POS_DB');
    this.version(1).stores({
      orders: '++id, status, createdAt'
    });
  }
}

export const db = new POSDB();
