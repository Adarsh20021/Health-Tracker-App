import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET || 'health-tracker-secret-2026';

let isMongooseConnected = false;

if (MONGODB_URI && !MONGODB_URI.includes('<username>') && MONGODB_URI.trim() !== '') {
  console.log('Connecting to MongoDB Atlas...');
  mongoose.connect(MONGODB_URI)
    .then(() => {
      isMongooseConnected = true;
      console.log('Successfully connected to MongoDB Atlas.');
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB Atlas. Falling back to local file storage.', err);
    });
} else {
  console.log('MONGODB_URI not provided or has placeholders. Falling back to local file storage.');
}

// User schema for Mongoose
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// DailyLog schema for Mongoose
const dailyLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  calories: { type: Number, required: true },
  water: { type: Number, required: true }, // Liters
  steps: { type: Number, required: true },
  sleepHours: { type: Number, required: true }
});

const MongooseUser: any = mongoose.models.User || mongoose.model('User', userSchema);
const MongooseDailyLog: any = mongoose.models.DailyLog || mongoose.model('DailyLog', dailyLogSchema);

// JSON file database for sandbox fallback
const LOCAL_DB_PATH = path.join(process.cwd(), 'local-db.json');

export interface UserType {
  _id: string;
  name: string;
  email: string;
  password?: string;
}

export interface DailyLogType {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  calories: number;
  water: number;
  steps: number;
  sleepHours: number;
}

interface LocalDBFormat {
  users: UserType[];
  logs: DailyLogType[];
}

function readLocalDB(): LocalDBFormat {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const initialData: LocalDBFormat = { users: [], logs: [] };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const dataStr = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(dataStr);
  } catch {
    return { users: [], logs: [] };
  }
}

function writeLocalDB(data: LocalDBFormat) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  isMongoDB: () => isMongooseConnected,

  users: {
    async findOne(query: { email: string }): Promise<UserType | null> {
      const emailLower = query.email.toLowerCase().trim();
      if (isMongooseConnected) {
        const user = await MongooseUser.findOne({ email: emailLower }).lean();
        if (user) {
          return { ...user, _id: (user._id as any).toString() } as UserType;
        }
        return null;
      } else {
        const local = readLocalDB();
        const user = local.users.find(u => u.email.toLowerCase() === emailLower);
        return user ? { ...user } : null;
      }
    },

    async create(data: Omit<UserType, '_id'>): Promise<UserType> {
      const emailLower = data.email.toLowerCase().trim();
      if (isMongooseConnected) {
        const user = await MongooseUser.create({
          name: data.name,
          email: emailLower,
          password: data.password
        });
        const doc = user.toObject();
        return { ...doc, _id: doc._id.toString() } as UserType;
      } else {
        const local = readLocalDB();
        const id = Math.random().toString(36).substring(2, 11);
        const newUser: UserType = {
          _id: id,
          name: data.name,
          email: emailLower,
          password: data.password
        };
        local.users.push(newUser);
        writeLocalDB(local);
        return newUser;
      }
    },

    async findById(id: string): Promise<UserType | null> {
      if (isMongooseConnected) {
        try {
          const user = await MongooseUser.findById(id).lean();
          if (user) {
            return { ...user, _id: (user._id as any).toString() } as UserType;
          }
        } catch {
          return null;
        }
        return null;
      } else {
        const local = readLocalDB();
        const user = local.users.find(u => u._id === id);
        return user ? { ...user } : null;
      }
    }
  },

  logs: {
    async find(query: { userId: string }): Promise<DailyLogType[]> {
      if (isMongooseConnected) {
        const list = await MongooseDailyLog.find({ userId: query.userId }).sort({ date: 1 }).lean();
        return list.map((item: any) => ({ ...item, _id: item._id.toString() })) as DailyLogType[];
      } else {
        const local = readLocalDB();
        const list = local.logs.filter(log => log.userId === query.userId);
        return list.sort((a, b) => a.date.localeCompare(b.date));
      }
    },

    async findOne(query: { userId: string; date: string }): Promise<DailyLogType | null> {
      if (isMongooseConnected) {
        const item = await MongooseDailyLog.findOne({ userId: query.userId, date: query.date }).lean();
        if (item) {
          return { ...item, _id: (item._id as any).toString() } as DailyLogType;
        }
        return null;
      } else {
        const local = readLocalDB();
        const item = local.logs.find(log => log.userId === query.userId && log.date === query.date);
        return item ? { ...item } : null;
      }
    },

    async updateOrCreate(
      query: { userId: string; date: string },
      updates: Omit<DailyLogType, '_id' | 'userId' | 'date'>
    ): Promise<DailyLogType> {
      if (isMongooseConnected) {
        const item = await MongooseDailyLog.findOneAndUpdate(
          { userId: query.userId, date: query.date },
          { $set: updates },
          { new: true, upsert: true }
        ).lean();
        return { ...item, _id: (item._id as any).toString() } as DailyLogType;
      } else {
        const local = readLocalDB();
        const existingIdx = local.logs.findIndex(log => log.userId === query.userId && log.date === query.date);
        if (existingIdx !== -1) {
          local.logs[existingIdx] = {
            ...local.logs[existingIdx],
            ...updates
          };
          writeLocalDB(local);
          return local.logs[existingIdx];
        } else {
          const id = Math.random().toString(36).substring(2, 11);
          const newLog: DailyLogType = {
            _id: id,
            userId: query.userId,
            date: query.date,
            ...updates
          };
          local.logs.push(newLog);
          writeLocalDB(local);
          return newLog;
        }
      }
    }
  }
};
