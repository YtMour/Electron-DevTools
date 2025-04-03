import Dexie from 'dexie';
import type { CryptoHistory } from '../types/crypto';

export type { CryptoHistory };

class CryptoDB extends Dexie {
  history!: Dexie.Table<CryptoHistory, number>;

  constructor() {
    super('CryptoDB');
    this.version(1).stores({
      history: '++id, tool, mode, timestamp'
    });
  }

  async addHistory(record: Omit<CryptoHistory, 'id'>) {
    return await this.history.add({
      ...record,
      timestamp: Date.now()
    });
  }

  async getHistory(tool: string, limit: number = 20) {
    return await this.history
      .where('tool')
      .equals(tool)
      .reverse()
      .sortBy('timestamp')
      .then(records => records.slice(0, limit));
  }

  async deleteHistory(id: number) {
    return await this.history.delete(id);
  }

  async clearHistory(tool: string) {
    return await this.history
      .where('tool')
      .equals(tool)
      .delete();
  }
}

// 创建单例实例
const cryptoDB = new CryptoDB();

// 导出实例
export { cryptoDB };

export const getHistory = async (tool: string, limit: number = 20): Promise<CryptoHistory[]> => {
  return await cryptoDB.history
    .where('tool')
    .equals(tool)
    .reverse()
    .sortBy('timestamp')
    .then(records => records.slice(0, limit));
};

export const addHistory = async (record: Omit<CryptoHistory, 'id'>): Promise<number> => {
  return await cryptoDB.history.add(record);
};

export const clearHistory = async (tool: string): Promise<void> => {
  await cryptoDB.history.where('tool').equals(tool).delete();
}; 