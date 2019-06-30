#!/usr/bin/env node
const pathNode = require('path');
const marked = require('marked');
const fs = require('fs');
const fileHound = require('filehound');
const util = require('util');
const fetch = require('node-fetch');
//let brokenLinksArray = [];

let userPath = process.argv[2];
userPath = pathNode.resolve(userPath);
userPath = pathNode.normalize(userPath);
let options = {
     stats: false,
     validate: false
}
let firstOption = process.argv[3];
let secondOption = process.argv[4];

if(firstOption ==="--validate" && secondOption === "--stats"||firstOption==="--stats" && secondOption === "--validate"){
     options.validate = true;
     options.stats = true;
}else if(firstOption==="--stats"|| secondOption === "--stats"){
     options.stats = true;
}else if(firstOption==="--validate"|| secondOption === "--validate"){
     options.validate = true;
}

// //funcion para saber la ruta es archivo o directorio
const isDirectory = async path => {
     try {
       return (await util.promisify(fs.lstat)(path)).isDirectory()
     } catch (e) {
         console.log(e);
       return false // or custom the error
     }
}

// funcion que lee archivo y extrae los links como un array de objetos
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
     return new Promise((resolve, reject)=>{
          const mdFiles = fileHound.create()
          .paths(path)
          .ext('md') 
          .find()
          .then(mdFiles=>{
              mdFiles.forEach(el => {
                   resolve(links(el))
              })
               //resolve(links(mdFiles))
          })
          .catch(err => {
               reject(err)
          })
     })

}
// mostrar en la consola contenido de cada link sin opciones
const printLinks = (links)=>{
     links.map(link=>{
          console.log(link.href, link.file, link.text);
     })
}

const validateLinks = (links)=>{
     return Promise.all(links.map(link=>{
          return new Promise((resolve, reject)=>{
               fetch(link.href)
                    .then(res=>{
                         link.statusCode = res.status;
                         link.statusText = res.statusText;
                         console.log(link.text, link.href, link.statusCode, link.statusText, link.file)
                         resolve(link)
                        
                    })
                    .catch((err)=>{
                         link.statusCode = 0;
                         link.statusText = err.code;
                        console.log(link.text, link.href, link.statusCode, link.statusText, link.file)
                        resolve(link)
                         reject(err);
                    })
          })
     }))
    
 }  

 const statsLinks = (links) =>{
     const hrefLinks = links.map(el=>el.href);
     let linksTotal = hrefLinks.length;
     console.log("Links Totales: ",linksTotal);
     const uniqueLinks = [...new Set(hrefLinks)].length;
     console.log("Links Unicos: ",uniqueLinks);
 } 

 const validateStatsLinks = (links)=>{
     return Promise.all(links.map(link=>{
          return new Promise((resolve, reject)=>{
               fetch(link.href)
                    .then(res=>{
                         link.statusCode = res.status;
                         link.statusText = res.statusText;
                         resolve(link)
                    })
                    .catch((err)=>{
                         link.statusCode = 0;
                         link.statusText = err.code;
                         resolve(link);
                         reject(err)
                    })
          })
     }))
    
 }  

 const statusCodeLinks = (links)=>{
      let linksBroken = links.filter(link=>{
           return link.statusCode < 200 || link.statusCode > 400
      });
      statsLinks(links);
      console.log("Links Rotos: ",linksBroken.length)
     // let hrefLink = [];
     // let responseStats = {};
     // hrefLink = links.map(link=>{
     //     return link.href;
     // });
     // responseStats.linksTotal=hrefLink.length;
     // let hrefSet= new Set(hrefLink);
     // responseStats.linksUnique=hrefSet.size;
     // if(options && options.validate){
     //     responseStats.linksBroken = links.filter(link=>{            
     //         return link.status===0 || link.status>=400;
     //     }).length;
     //     responseStatusCodesHTTP(responseStats, links);
         
     // }
     // return responseStats;
 }
 //const validateStatsLinks = (links)=>{ 
// let brokenLinksArray = [];
// const getBrokenLinks = (links) =>{
//      //let brokenLinksArray = [];
//      links.map(link =>{
//           return new Promise((resolve, reject)=>{
//                fetch(link.href)
//                     .then(res=>{
//                          //console.log(res.status)
//                          if(res.status<200 || res.status>400){
//                                  resolve(console.log(res.status))
                                                            
//                          }
//                          //resolve(brokenLinksArray) 
//                     })
//                     .catch(err=>{
//                          reject(err)
//                     })
//           })
//      })
// }
// const validateStatsLinks = (links) =>{
//      getBrokenLinks(links)
     // return new Promise((resolve, reject)=>{
     //      getBrokenLinks(links)
     //           .then(res=>{
     //                resolve(console.log(res))
     //           })
     //           .catch(err=>{
     //                reject(err)
     //           })
     // })
              
   
// }
     // hrefLinks.forEach(el=>{
     //      fetch(el)
     //           .then(res=>{
     //                //console.log(res.status)
     //                if(res.status<200 || res.status>400){
     //                linksFail.push(res.status);  
     //                // console.log(linksFail);                  
     //                }
                              
     //           })
     //           .catch(error=>{
     //                if(error.code==="ENOTFOUND")
     //                console.log(error.code, "FAIL")
     //           })
              
     // })
     
     
//}
const mdLinks = (path, options) => {   
     isDirectory(path)
          .then(res=>{
               let isDir = res;
               if(isDir===true){
                    return new Promise ((resolve, reject)=>{
                         extractMdFiles(path)
                              .then((links)=>{
                                   if(options.stats&&options.validate){
                                        validateStatsLinks(links)
                                             .then(res=>{
                                                  resolve(statusCodeLinks(res))
                                                                                                             
                                             })
                                   }else if(options.stats){
                                        resolve(statsLinks(links))
                                   }else if(options.validate){
                                        resolve(validateLinks(links))
                                   }else(
                                        resolve(printLinks(links))
                                   )
                                                                           
                              })
                              .catch(err=>{
                                   reject(err)
                              })
                    })
                    
               }else{
                    return new Promise ((resolve, reject)=>{
                         links(path)
                         .then((links)=>{
                              if(options.stats&&options.validate){
                                   validateStatsLinks(links)
                                        .then(res=>{
                                             resolve(statusCodeLinks(res))
                                                                                                    
                                        })
                              }else if(options.stats){
                                   resolve(statsLinks(links))
                              }else if(options.validate){
                                   resolve(validateLinks(links))
                              }else{
                                   resolve(printLinks(links))
                              }
                         })
                         .catch(err=>{
                              reject(err)
                         })
                         
                    })
                    
               }

          })
          .catch(err=>{
               console.log(err)
          })
}
 mdLinks(userPath, options);

