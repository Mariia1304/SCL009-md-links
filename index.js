const pathNode = require('path');
const marked = require('marked');
const fs = require('fs');
const fileHound = require('filehound');
const util = require('util');
const fetch = require('node-fetch');

let userPath = process.argv[2];
userPath = pathNode.resolve(userPath);
userPath = pathNode.normalize(userPath);
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

// //funcion para saber la rura es archivo o directorio
const isDirectory = async path => {
     try {
       return (await util.promisify(fs.lstat)(path)).isDirectory()
     } catch (e) {
         console.log(e);
       return false // or custom the error
     }
}

// const whatIsPath = (path)=>{
//      isDirectory(path)
//      .then(res=>{
//           let isDir = res;
          
//           if(isDir===true){
//                console.log("directorio")
//               extractMdFiles(path); 
//           }else{
//               links(path)
//                .then(res=>{
//                     console.log(res);
//                     fetchLinks(res);
//                })
//                // .then(res =>{
//                //      console.log(res);
//                // })
//                .catch(err=>{
//                     console.log(err);
//                })
              
//           }   
//      })
//      .catch(err=>{
//           console.log(err);
//      })
// }
//whatIsPath(userPath);

// // funcion que lee archivo y extrae los links
const links = (path) =>{
     if(pathNode.extname(path) != ".md"){
        console.log("Es archivo pero no .md")  
     }else{
     return new Promise((resolve,reject)=>{
         
          fs.readFile(path,"utf-8", (err,data) =>{
               if(err){ 
                    reject(err); 
               }else{
                    let links =[];   
                    const renderer = new marked.Renderer();
                    renderer.link = function(href, title, text){
                         links.push({
                              href:href,
                              text:text,
                              file:path
                         }) 
                    }
                    marked(data, {renderer:renderer});
                  

                    resolve(links);        
                    
                    
                    
               }
          })
     
         
     })
}
          
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
          //console.log(arrayMdFiles);
          arrayMdFiles.forEach(el =>{
              links(el)
              .then(res=>{
                   fetchLinks(res);
              })
          })
         
     })
}

const fetchLinks = (links) =>{

     let arrayLinksWithStatus =[];
     links.forEach(el=>{
          let link = {};
          if(validate === false && stats === false){
          console.log(el.file, el.href, el.text);
          }else if(validate === true){
          fetch(el.href)
               .then(res=>{
                    link.href = el.href;
                    link.text = el.text;
                    link.file = el.file;
                    link.statusCode = res.status;
                    link.statusText = res.statusText;
                    arrayLinksWithStatus.push(link);
                    //console.log(arrayLinksWithStatus);
               
                    console.log(el.file, el.href, res.status,res.statusText, el.text);
               
               })
               .catch(err =>{
                    console.error("error ", err)
               })
          }
             
     })
     return arrayLinksWithStatus;
                   
}     
               
     
const mdLinks = (path, options) => {
     return new Promise((resolve, reject)=>{
          isDirectory(path)
               .then(res=>{
                    let isDir = res;
                    if(isDir===true){
                         console.log("directorio")
                        resolve(extractMdFiles(path)); 
                    }else{
                        links(path)
                         .then(res=>{
                              //console.log(res);
                              resolve(fetchLinks(res));
                         })
                         // .then(res =>{
                         //      console.log(res);
                         // })
                         .catch(err=>{
                              reject(err);
                         })
                        
                    }

               })
               .catch(err=>{
                    console.log(err)
               })
    })
}
mdLinks(userPath);