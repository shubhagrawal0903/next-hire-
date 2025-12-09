
const pdfLib = require('pdf-parse');

// Simulate the import logic from service
let pdfParse = pdfLib;
if (pdfLib.default) { pdfParse = pdfLib.default; }
if (typeof pdfParse !== 'function' && pdfLib.PDFParse) { pdfParse = pdfLib.PDFParse; }

console.log('Using pdfParse:', typeof pdfParse);

try {
    const buffer = Buffer.from('Dummy PDF Content');
    // @ts-ignore
    const instance = new pdfParse(buffer);

    console.log('Instance keys:', Object.keys(instance));

    if (instance.doc) {
        console.log('instance.doc keys:', Object.keys(instance.doc));
    }

    // Check prototype for methods
    const proto = Object.getPrototypeOf(instance);
    console.log('Prototype methods:', Object.getOwnPropertyNames(proto));

    // Try to find text
    if (typeof instance.text === 'string') console.log('Found .text property');
    if (typeof instance.getText === 'function') console.log('Found .getText() method');
    if (typeof instance.extractText === 'function') console.log('Found .extractText() method');

} catch (e) {
    console.error('Error:', e);
}
