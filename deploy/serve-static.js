const express = require('express');
const path = require('path');
const fs = require('fs');

const [, , staticDirArg] = process.argv;
const PORT = parseInt(process.env.PORT || process.env.ADMIN_PORT || '3001', 10);

if (!staticDirArg) {
  console.error('Static directory argument is required');
  process.exit(1);
}

const staticDir = path.resolve(staticDirArg);

if (!fs.existsSync(staticDir)) {
  console.error(`Static directory not found: ${staticDir}`);
  process.exit(1);
}

const app = express();

app.use(express.static(staticDir));

app.get('*', (req, res) => {
  const indexFile = path.join(staticDir, 'index.html');
  if (!fs.existsSync(indexFile)) {
    res.status(404).send('index.html not found in static directory');
    return;
  }
  res.sendFile(indexFile);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serving static files from ${staticDir} on port ${PORT}`);
});
