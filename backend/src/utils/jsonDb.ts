import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../db.json');

export interface UserDB {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  refreshToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationDB {
  _id: string;
  tripId: string;
  tripName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: UserDB[];
  reservations: ReservationDB[];
}

export const readDB = (): DatabaseSchema => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDB({ users: [], reservations: [] });
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { users: [], reservations: [] };
  }
};

export const writeDB = (data: DatabaseSchema): void => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing database:', error);
  }
};
