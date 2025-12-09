
const fs = require('fs');
const logFile = 'test-pdf-output.txt';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

try {
    fs.writeFileSync(logFile, 'Starting test...\n');
    const pdfParseLib = require('pdf-parse');
    log('Original require type: ' + typeof pdfParseLib);
    log('Keys: ' + Object.keys(pdfParseLib).join(', '));

    const pdfParse = typeof pdfParseLib === 'function' ? pdfParseLib : pdfParseLib.default;
    log('Resolved pdfParse type: ' + typeof pdfParse);
    log('Is function? ' + (typeof pdfParse === 'function'));

    if (typeof pdfParse === 'function') {
        log('SUCCESS: pdfParse is a function');
    } else {
        log('FAILURE: pdfParse is NOT a function');
    }
} catch (e) {
    log('Error: ' + e.message);
}
