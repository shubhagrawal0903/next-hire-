const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src', 'app', 'profile', '[[...user_profile]]');

console.log('Attempting to delete:', dirPath);

try {
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log('✓ Successfully deleted the conflicting route directory!');
        console.log('✓ The routing error should now be fixed.');
    } else {
        console.log('Directory does not exist:', dirPath);
    }
} catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
}
