const { exec } = require('child_process');

// Kill process on port 5000
exec('netstat -ano | findstr :5000', (err, stdout) => {
  if (err) {
    console.error('Error finding process:', err);
    return;
  }

  const lines = stdout.split('\n');
  const pids = new Set();

  lines.forEach(line => {
    const match = line.match(/LISTENING\s+(\d+)/);
    if (match) {
      pids.add(match[1]);
    }
  });

  if (pids.size === 0) {
    console.log('No process found on port 5000');
    process.exit(0);
  }

  pids.forEach(pid => {
    console.log(`Killing process ${pid} on port 5000...`);
    exec(`taskkill /PID ${pid} /F`, (killErr, killStdout, killStderr) => {
      if (killErr) {
        console.error(`Error killing process ${pid}:`, killStderr);
      } else {
        console.log(`Successfully killed process ${pid}`);
        console.log(killStdout);
      }
    });
  });
});
