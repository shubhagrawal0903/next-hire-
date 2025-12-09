const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'app', 'profile', '[[...user_profile]]');

try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log('✓ Successfully deleted:', dirPath);
} catch (error) {
    console.error('✗ Error deleting directory:', error.message);
    process.exit(1);
}
