const { spawn } = require('child_process');

console.log('Starting Next.js development server...');

const nextDev = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

nextDev.on('close', (code) => {
  console.log(`Next.js dev server exited with code ${code}`);
});

nextDev.on('error', (error) => {
  console.error('Error starting Next.js:', error);
});