const path = require('path');
const marked = require("marked");
const fs = require('fs');
const fileHound = require('filehound');
const util = require('util');

let userPath = process.argv[2];
userPath = path.resolve(userPath);
userPath = path.normalize(userPath);
let options = [process.argv[3],process.argv[4]];
let stats = false;
let validate = false;


if(options[0]==="--validate" && options[1]=== "--stats"||options[0]==="--stats" && options[1]=== "--validate"){
     validate = true;
     stats = true;
}else if(options[0]==="--stats"){
     stats = true;
}else if(options[0]==="--validate"){
     validate = true;
}
console.log(stats);
//funcion para saber la rura es archivo o directorio
const isDirectory = async path => {
     try {
         
       return (await util.promisify(fs.lstat)(path)).isDirectory()
     } catch (e) {
         console.log(e);
       return false // or custom the error
     }
   }

const whatIsPath = (path)=>{
     isDirectory(path)
     .then(res=>{
          let isDir = res;
          
          if(isDir===true){
              extractMdFiles(path); 
          }else{
              links(path);
          }   
     })
     .catch(err=>{
          console.log(err);
     })
}
whatIsPath(userPath);

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

// funcion para encontrar y extraer archivos con extencion .md de un directorio
const extractMdFiles = (path) =>{
    const files = fileHound.create()
    .paths(path)
    .ext('md')
    .find();
     let arrayMdFiles = [];
     files
     .then(res=>{
          arrayMdFiles = res;
          console.log(arrayMdFiles);
          arrayMdFiles.forEach(el =>{
              links(el);
          })
         
     })
}



  