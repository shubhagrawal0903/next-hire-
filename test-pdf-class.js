
const pdfLib = require('pdf-parse');
const PDFParse = pdfLib.PDFParse || pdfLib.default || pdfLib;

console.log('Testing PDFParse class usage...');

try {
    // Mock buffer
    const buffer = Buffer.from('test pdf content');

    console.log('Attempt 1: new PDFParse(buffer)');
    try {
        const instance = new PDFParse(buffer);
        console.log('Success 1! Instance keys:', Object.keys(instance));
        if (instance.text) console.log('Text:', instance.text);
        if (instance.extractText) console.log('Has extractText method');
    } catch (e) {
        console.log('Error 1:', e.message);
    }

    console.log('Attempt 2: new PDFParse()');
    try {
        const instance = new PDFParse();
        console.log('Success 2! Instance keys:', Object.keys(instance));
        // Check for likely methods
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
        console.log('Methods:', methods);
    } catch (e) {
        console.log('Error 2:', e.message);
    }

} catch (e) {
    console.error('Fatal error:', e);
}
