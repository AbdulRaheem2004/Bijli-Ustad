import tariffsBaseline from '../engine/tariffs.json' with { type: 'json' };
import manifestBaseline from '../engine/tariffs-source-manifest.json' with { type: 'json' };

export interface TariffSyncStatus {
  version: string;
  lastUpdated: string;
  source: 'local_bundled' | 'remote_cdn' | 'browser_cache';
  authority: string;
}

const STORAGE_KEY_TARIFFS = 'bijli_explainer_tariffs_v1';
const STORAGE_KEY_UPDATED = 'bijli_explainer_tariffs_updated_v1';

// Public GitHub Pages / jsDelivr CDN endpoint for live updates
const REMOTE_FEED_URL = 'https://raw.githubusercontent.com/abdul/bijli-tariffs-feed/main/tariffs-feed.json';

export class TariffSyncService {
  private static activeTariffs = tariffsBaseline;

  public static getTariffs() {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY_TARIFFS);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.version) {
            this.activeTariffs = parsed;
          }
        }
      } catch {
        // Fall back to baseline
      }
    }
    return this.activeTariffs;
  }

  public static getManifest() {
    return manifestBaseline;
  }

  public static getSyncStatus(): TariffSyncStatus {
    const current = this.getTariffs();
    let source: TariffSyncStatus['source'] = 'local_bundled';

    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_TARIFFS)) {
      source = 'browser_cache';
    }

    return {
      version: current.version,
      lastUpdated: current.last_updated,
      source,
      authority: manifestBaseline.authority,
    };
  }

  public static async checkForRemoteUpdates(): Promise<{ updated: boolean; newVersion?: string; error?: string }> {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') {
      return { updated: false, error: 'Offline / Server environment' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(REMOTE_FEED_URL, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return { updated: false, error: `HTTP ${response.status}` };
      }

      const remoteData = await response.json();
      if (remoteData && remoteData.version && remoteData.version !== this.activeTariffs.version) {
        this.activeTariffs = remoteData;
        localStorage.setItem(STORAGE_KEY_TARIFFS, JSON.stringify(remoteData));
        localStorage.setItem(STORAGE_KEY_UPDATED, new Date().toISOString());
        return { updated: true, newVersion: remoteData.version };
      }

      return { updated: false };
    } catch {
      return { updated: false, error: 'Using cached official SRO rates (offline)' };
    }
  }
}
