import Dexie from 'dexie';
import type { CryptoHistory } from '../types/crypto';

class CryptoDB extends Dexie {
  history!: Dexie.Table<CryptoHistory, number>;

  constructor() {
    super('CryptoDB');
    this.version(1).stores({
      history: '++id, type, mode, timestamp'
    });
  }

  async addHistory(record: Omit<CryptoHistory, 'id'>) {
    return await this.history.add({
      ...record,
      timestamp: Date.now()
    });
  }

  async getHistory(type: string) {
    return await this.history
      .where('type')
      .equals(type)
      .reverse()
      .sortBy('timestamp');
  }

  async deleteHistory(id: number) {
    return await this.history.delete(id);
  }

  async clearHistory(type: string) {
    return await this.history
      .where('type')
      .equals(type)
      .delete();
  }
}

export const cryptoDB = new CryptoDB(); 