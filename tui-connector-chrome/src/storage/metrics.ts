export const METRICS_KEY = 'metrics';

export interface IMetrics {
  bookmarksCount: number;
  bookmarkChangesSent: number;
  bookmarkChangesReceived: number;
}

const DEFAULT_METRICS: IMetrics = {
  bookmarksCount: 0,
  bookmarkChangesSent: 0,
  bookmarkChangesReceived: 0,
};

export class Metrics {
  private static _instance: Metrics;

  private constructor(private _metrics: IMetrics) {}

  static async create(): Promise<Metrics> {
    if (Metrics._instance) {
      return Metrics._instance;
    }
    const { metrics } = await chrome.storage.local.get<{
      [METRICS_KEY]: IMetrics;
    }>([METRICS_KEY]);
    Metrics._instance = new Metrics(metrics || DEFAULT_METRICS);
    return Metrics._instance;
  }
  static get instance(): Metrics {
    if (!Metrics._instance) {
      throw new Error('Stats not initialized');
    }
    return Metrics._instance;
  }

  get<K extends keyof IMetrics>(key: K): IMetrics[K] {
    return this._metrics[key];
  }

  get metrics(): IMetrics {
    return this._metrics;
  }

  async set<K extends keyof IMetrics>(
    key: K,
    value: IMetrics[K],
  ): Promise<number> {
    this._metrics[key] = value;
    chrome.storage.local.set({ [METRICS_KEY]: this._metrics });
    return this._metrics[key];
  }

  async inc<K extends keyof IMetrics>(key: K, incValue = 1): Promise<number> {
    return this.set(key, this._metrics[key] + incValue);
  }

  async dec<K extends keyof IMetrics>(key: K, decValue = 1): Promise<number> {
    return this.set(key, this._metrics[key] - decValue);
  }
}
