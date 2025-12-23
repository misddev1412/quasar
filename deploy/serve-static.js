const http = require('http');
const path = require('path');
const fs = require('fs');

const [, , cliStaticDir] = process.argv;
const DEFAULT_STATIC_DIR = path.resolve(__dirname, '..', 'dist', 'apps', 'admin');
const staticDirArg = cliStaticDir || process.env.ADMIN_STATIC_DIR || DEFAULT_STATIC_DIR;
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

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = url.pathname.replace(/^\/+/, '');
  if (pathname === 'admin') {
    pathname = '';
  } else if (pathname.startsWith('admin/')) {
    pathname = pathname.slice('admin/'.length);
  }

  if (!pathname || pathname.endsWith('/')) {
    pathname = path.join(pathname, 'index.html');
  }

  if (pathname.startsWith('../')) {
    pathname = 'index.html';
  }

  const filePath = path.join(staticDir, pathname);

  const serveFile = (resolvedPath) => {
    fs.stat(resolvedPath, (statErr, stats) => {
      if (statErr || !stats.isFile()) {
        return serveIndex();
      }

      const ext = path.extname(resolvedPath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(resolvedPath).pipe(res);
    });
  };

  const serveIndex = () => {
    const indexFile = path.join(staticDir, 'index.html');
    fs.stat(indexFile, (err, stats) => {
      if (err || !stats.isFile()) {
        const message = `index.html not found in static directory (${indexFile})`;
        console.warn(message);
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(message);
        return;
      }
      res.writeHead(200, { 'Content-Type': mimeTypes['.html'] });
      fs.createReadStream(indexFile).pipe(res);
    });
  };

  serveFile(filePath);
});

server.listen(PORT, '0.0.0.0', () => {
  process.stdout.write(`Serving static files from ${staticDir} on port ${PORT}\n`);
});
