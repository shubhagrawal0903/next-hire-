
const fs = require('fs');
const logFile = 'inspect-lib-output.txt';

function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
}

try {
    fs.writeFileSync(logFile, 'Starting inspection...\n');
    const lib = require('pdf-parse');
    log('Lib keys: ' + Object.keys(lib).join(', '));

    const { PDFParse } = lib;
    log('PDFParse type: ' + typeof PDFParse);

    if (typeof PDFParse === 'function') {
        log('PDFParse prototype keys: ' + Object.getOwnPropertyNames(PDFParse.prototype).join(', '));
        log('PDFParse static keys: ' + Object.keys(PDFParse).join(', '));
    }
} catch (e) {
    log('Error: ' + e.message);
}
