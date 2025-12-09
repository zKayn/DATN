#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Đang dừng tất cả processes...');

let killed = false;

try {
  // Kill tất cả node processes NGOẠI TRỪ process hiện tại
  if (process.platform === 'win32') {
    try {
      // Kill node processes nhưng bỏ qua process hiện tại
      execSync('taskkill /F /IM node.exe /T /FI "PID ne ' + process.pid + '"', { stdio: 'pipe' });
      killed = true;
    } catch (e) {
      // Không có process nào để kill
    }
  } else {
    try {
      execSync('pkill -9 -f "node.*turbo\\|next"', { stdio: 'pipe' });
      killed = true;
    } catch (e) {}
  }
} catch (error) {}

if (killed) {
  console.log('✅ Đã dừng các processes cũ');
  console.log('⏳ Đợi 3 giây để ports được giải phóng...');

  if (process.platform === 'win32') {
    execSync('powershell -Command "Start-Sleep -Seconds 3"', { stdio: 'ignore' });
  } else {
    execSync('sleep 3', { stdio: 'ignore' });
  }
} else {
  console.log('✅ Không có process cũ nào đang chạy');
}

console.log('✅ Sẵn sàng!\n');
process.exit(0);
