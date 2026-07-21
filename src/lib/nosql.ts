/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HoneypotLog {
  id: string;
  timestamp: string;
  ip: string;
  internalIp?: string;
  username: string;
  password: string;
  userAgent: string;
  flags: string[];
  browser: string;
  os: string;
}

// A simple client-side NoSQL helper communicating with our Node/Express backend
class LocalNoSQL {
  public parseUA(ua: string): { browser: string; os: string } {
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    const userAgentLower = ua.toLowerCase();

    // Browser Detection
    if (userAgentLower.includes('firefox')) {
      browser = 'Firefox';
    } else if (userAgentLower.includes('edg')) {
      browser = 'Edge';
    } else if (userAgentLower.includes('chrome') && !userAgentLower.includes('chromium')) {
      browser = 'Chrome';
    } else if (userAgentLower.includes('safari') && !userAgentLower.includes('chrome')) {
      browser = 'Safari';
    } else if (userAgentLower.includes('opera') || userAgentLower.includes('opr')) {
      browser = 'Opera';
    } else if (userAgentLower.includes('bot') || userAgentLower.includes('crawler') || userAgentLower.includes('spider')) {
      browser = 'Crawler Bot';
    }

    // OS Detection
    if (userAgentLower.includes('win')) {
      os = 'Windows';
    } else if (userAgentLower.includes('macintosh') || userAgentLower.includes('mac os x')) {
      os = 'macOS';
    } else if (userAgentLower.includes('linux')) {
      os = 'Linux';
    } else if (userAgentLower.includes('iphone') || userAgentLower.includes('ipad') || userAgentLower.includes('ipod')) {
      os = 'iOS';
    } else if (userAgentLower.includes('android')) {
      os = 'Android';
    }

    return { browser, os };
  }

  public async getAll(): Promise<HoneypotLog[]> {
    try {
      const response = await fetch('/api/logs');
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (e) {
      console.error('Error fetching logs from database', e);
      return [];
    }
  }

  public async insert(log: Omit<HoneypotLog, 'id' | 'timestamp' | 'browser' | 'os' | 'flags'>): Promise<HoneypotLog> {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(log)
      });
      if (!response.ok) throw new Error('Failed to insert log');
      return await response.json();
    } catch (e) {
      console.error('Error inserting log into database', e);
      // Fallback object to satisfy signature
      return {
        ...log,
        id: `fallback_${Date.now()}`,
        timestamp: new Date().toISOString(),
        browser: this.parseUA(log.userAgent).browser,
        os: this.parseUA(log.userAgent).os,
        flags: []
      };
    }
  }

  public async clear(): Promise<void> {
    try {
      await fetch('/api/logs/clear', { method: 'POST' });
    } catch (e) {
      console.error('Error clearing database', e);
    }
  }

  public async resetToDefault(): Promise<HoneypotLog[]> {
    try {
      const response = await fetch('/api/logs/reset', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to reset database');
      return await response.json();
    } catch (e) {
      console.error('Error resetting database', e);
      return [];
    }
  }
}

export const db = new LocalNoSQL();
