
const pdfLib = require('pdf-parse');
console.log('Type of export:', typeof pdfLib);
console.log('Keys:', Object.keys(pdfLib));

if (typeof pdfLib === 'function') {
    console.log('It IS a function!');
} else {
    console.log('It is NOT a function.');
    if (pdfLib.default) console.log('Type of .default:', typeof pdfLib.default);
    if (pdfLib.PDFParse) console.log('Type of .PDFParse:', typeof pdfLib.PDFParse);
}
