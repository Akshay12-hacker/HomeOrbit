const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8082;
const LOGS_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOGS_DIR, 'app.log');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const server = http.createServer((req, res) => {
  // Add CORS headers so device can hit it without issues
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/_local_logs' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const entries = JSON.parse(body);
        const formattedLogs = entries.map(e => 
          `[${e.timestamp}] [${e.level.toUpperCase()}] ${e.event}\nData: ${JSON.stringify(e, null, 2)}\n----------------------------------------`
        ).join('\n') + '\n';
        
        fs.appendFileSync(LOG_FILE, formattedLogs);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        console.error('Failed to parse log POST body', e);
        res.writeHead(500);
        res.end('Error');
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==============================================`);
  console.log(`🔥 HomeOrbit PC Logger started on port ${PORT} 🔥`);
  console.log(`Logs will be written to: ${LOG_FILE}`);
  console.log(`Keep this terminal open while debugging.`);
  console.log(`==============================================\n`);
});
