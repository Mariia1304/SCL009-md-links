const marked = require("marked");
const fs = require('fs');
const path = require('path');
const fileHound = require('filehound');
const util = require('util');

// let userPath = process.argv[2];
// userPath = path.resolve(userPath);
// userPath = path.normalize(userPath);
//console.log(userPath);



// funcion que lee archivo y extrae los links
const links = (path) =>{
  fs.readFile(path,"utf-8", (error,data) =>{
    if(error) throw error;
    
    let links =[];

    const renderer = new marked.Renderer();

    renderer.link = function(href, title, text){

      links.push({
        
        href:href,
        text:text,
        file:path
      
      })

    }
    marked(data, {renderer:renderer})
      console.log(links)
  })

}

//funcion para encontrar y extraer archivos con extencion .md de un directorio
const extractMdFiles = (path) =>{
    const files = fileHound.create()
    .paths(path)
    .ext('md')
    .find();

files.then(console.log);
}
//extractMdFiles(userPath);

//funcion para saber la rura es archivo o directorio
const isDirectory = async path => {
    try {
        //console.log(path);
      return (await util.promisify(fs.lstat)(path)).isDirectory()
    } catch (e) {
        console.log(e);
      return false // or custom the error
    }
  }
 module.exports = { isDirectory }
// isDirectory(userPath);
// const isDirectory = (path)=>{
//     fs.lstat(path, (err, stats) => {

//         if(err)
//             return console.log(err); //Handle error
//         console.log(`Is file: ${stats.isFile()}`);
//         console.log(`Is directory: ${stats.isDirectory()}`);
//         // console.log(`Is symbolic link: ${stats.isSymbolicLink()}`);
//         // console.log(`Is FIFO: ${stats.isFIFO()}`);
//         // console.log(`Is socket: ${stats.isSocket()}`);
//         // console.log(`Is character device: ${stats.isCharacterDevice()}`);
//         // console.log(`Is block device: ${stats.isBlockDevice()}`);
//         if(stats.isFile()===true){
//             links(path);
//         }
//         if(stats.isDirectory()===true){
//             extractMdFiles(path);
//         }
//     });
// }

// isDirectory(userPath);
