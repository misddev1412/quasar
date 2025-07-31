# Admin App Port Configuration

The admin application now supports customizable port configuration through environment variables.

## Default Configuration

- **Default Port**: 4200
- **Environment Variable**: `PORT`

## Usage Examples

### 1. Default Port (4200)
```bash
# Using nx directly
nx serve admin

# Using yarn script
yarn admin:dev

# Both will start the admin app on http://localhost:4200
```

### 2. Custom Port via Environment Variable
```bash
# Start on port 3000
PORT=3000 nx serve admin

# Start on port 5000
PORT=5000 nx serve admin

# Using predefined yarn scripts
yarn admin:dev:3000  # Starts on port 3000
yarn admin:dev:5000  # Starts on port 5000
```

### 3. Using .env File
Create a `.env` file in the `apps/admin` directory:
```bash
# apps/admin/.env
PORT=3000
```

Then run:
```bash
nx serve admin
```

## Configuration Files

The port configuration is implemented in the following files:

1. **webpack.config.js** - Main webpack dev server configuration
2. **project.json** - NX project configuration with default port
3. **environment.ts** - Development environment configuration
4. **environment.prod.ts** - Production environment configuration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port number for the development server | 4200 |

## Troubleshooting

### Port Already in Use
If you get an `EADDRINUSE` error, it means the port is already occupied:
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
1. Use a different port: `PORT=3001 nx serve admin`
2. Stop the process using the port
3. Use the default port: `nx serve admin` (uses port 4200)

### Finding Available Ports
To check which ports are in use:
```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

## Production Considerations

In production environments, the port configuration should be handled by your deployment platform or reverse proxy (nginx, Apache, etc.). The environment configuration is primarily for development purposes.
