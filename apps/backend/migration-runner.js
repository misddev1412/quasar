const { spawn } = require('child_process');
const { config } = require('dotenv');

// Load environment variables
config();

function runWithTimeout(command, args, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Running: ${command} ${args.join(' ')}`);
    console.log(`⏱️  Timeout: ${timeoutMs / 1000}s`);
    
    const child = spawn(command, args, {
      stdio: 'pipe',
      env: {
        ...process.env,
        DEBUG: 'typeorm:*'
      }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      stdout += output;
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      console.error(output);
      stderr += output;
    });

    const timer = setTimeout(() => {
      console.log('⚠️ Command timed out, killing process...');
      child.kill('SIGTERM');
      reject(new Error(`Command timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        console.log('✅ Command completed successfully');
        resolve({ code, stdout, stderr });
      } else {
        console.log(`❌ Command failed with exit code ${code}`);
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      console.error('❌ Failed to start command:', error);
      reject(error);
    });
  });
}

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  if (!command) {
    console.error('❌ Usage: node migration-runner.js <command> [args...]');
    process.exit(1);
  }

  try {
    console.log('📋 Environment check:');
    console.log(`  - DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`  - DB_PORT: ${process.env.DB_PORT || '5432'}`);
    console.log(`  - DB_DATABASE: ${process.env.DB_DATABASE || 'quasar_db'}`);
    console.log(`  - DB_USERNAME: ${process.env.DB_USERNAME || 'postgres'}`);
    console.log('');

    const timeout = command.includes('show') ? 30000 : 60000;
    await runWithTimeout(command, args, timeout);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main(); 