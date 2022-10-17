// Node.js
const fs = require('fs')
const wasm_heif = require('./public/wasm_heif');


const main = async () => {
    // Load encoded HEIF image data in Uint8Array
    var myArrayBuffer = fs.readFileSync('./example.heic', null)
    let result;
    
    console.log("start!!")
    // Initialize the WebAssembly Module
    const heifModule = await wasm_heif()
    try {
        console.log("initialize")
        const alpha = false; // RGBA somehow not yet working ¯\_(ツ)_/¯
        result = heifModule.decode(myArrayBuffer, myArrayBuffer.length, alpha); // decode image data and return a new Uint8Array
        console.log(result)
        heifModule.free(); // clean up memory after encoding is done
    } catch (err) {
        console.log(err)
    }
}

main()
