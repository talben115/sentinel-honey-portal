const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'nosql_db.json');

function parseUA(ua) {
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

function getInitialLogs() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
  ];

  const ips = ['192.168.1.45', '82.102.14.99', '109.186.23.112', '185.220.101.5', '45.129.56.200'];
  const internalIps = ['10.0.12.5', '10.0.12.99', '10.0.12.112', '10.0.12.3', '10.0.12.200'];
  const usernames = ['admin', 'administrator', 'root', 'm_cohen', 'it_support', 'system'];
  const passwords = ['123456', 'password', 'Admin2026!', 'root', '1234', 'qwerty'];

  const initial = [];
  const now = new Date();

  for (let i = 0; i < 8; i++) {
    const timeDiff = (8 - i) * 3 * 60 * 1000 + Math.random() * 60000;
    const logTime = new Date(now.getTime() - timeDiff);
    const ua = userAgents[i % userAgents.length];
    const { browser, os } = parseUA(ua);
    
    initial.push({
      id: `log_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: logTime.toISOString(),
      ip: ips[i % ips.length],
      internalIp: internalIps[i % internalIps.length],
      username: usernames[i % usernames.length],
      password: passwords[i % passwords.length],
      userAgent: ua,
      flags: [],
      browser,
      os
    });
  }

  return initial;
}

function readLogs() {
  if (!fs.existsSync(dbPath)) {
    writeLogs([]);
    return [];
  }
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function writeLogs(logs) {
  fs.writeFileSync(dbPath, JSON.stringify(logs, null, 2), 'utf8');
}

function analyzePatterns(logs) {
  if (logs.length === 0) return logs;

  const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  // Reset flags first
  sortedLogs.forEach(log => {
    log.flags = (log.flags || []).filter(f => f !== 'BRUTE_FORCE');
  });

  const FIVE_MINUTES_MS = 5 * 60 * 1000;

  for (let i = 0; i < sortedLogs.length; i++) {
    const currentLog = sortedLogs[i];
    const currentTime = new Date(currentLog.timestamp).getTime();

    const sameUserInWindow = sortedLogs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return (
        log.username.toLowerCase() === currentLog.username.toLowerCase() &&
        Math.abs(currentTime - logTime) <= FIVE_MINUTES_MS
      );
    });

    const sameIPInWindow = sortedLogs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return (
        log.ip === currentLog.ip &&
        Math.abs(currentTime - logTime) <= FIVE_MINUTES_MS
      );
    });

    if (sameUserInWindow.length >= 3) {
      sameUserInWindow.forEach(log => {
        if (!log.flags.includes('BRUTE_FORCE')) {
          log.flags.push('BRUTE_FORCE');
        }
      });
    }

    if (sameIPInWindow.length >= 3) {
      sameIPInWindow.forEach(log => {
        if (!log.flags.includes('BRUTE_FORCE')) {
          log.flags.push('BRUTE_FORCE');
        }
      });
    }
  }

  return sortedLogs;
}

// API Routes
app.get('/api/logs', (req, res) => {
  res.json(readLogs());
});

app.post('/api/logs', (req, res) => {
  const { ip, internalIp, username, password, userAgent } = req.body;
  const logs = readLogs();
  const { browser, os } = parseUA(userAgent || '');

  const newLog = {
    id: `log_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ip: ip || '127.0.0.1',
    internalIp: internalIp || '10.0.12.99',
    username: username || '',
    password: password || '',
    userAgent: userAgent || '',
    browser,
    os,
    flags: []
  };

  logs.push(newLog);
  const analyzed = analyzePatterns(logs);
  writeLogs(analyzed);
  res.json(newLog);
});

app.post('/api/logs/clear', (req, res) => {
  writeLogs([]);
  res.json({ success: true });
});

app.post('/api/logs/reset', (req, res) => {
  const initial = getInitialLogs();
  const analyzed = analyzePatterns(initial);
  writeLogs(analyzed);
  res.json(analyzed);
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
