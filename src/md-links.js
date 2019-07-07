const pathNode = require('path');
const marked = require('marked');
const fs = require('fs');
const fileHound = require('filehound');
const fetch = require('node-fetch');

// funcion que lee archivo y extrae los links como un array de objetos
const links = (path) =>{
          return new Promise((resolve,reject)=>{
               if(pathNode.extname(path)!=".md"){
                    throw(new Error("Extensión no válida"));
               }
               fs.readFile(path,'utf-8',(err, content)=>{
                    if(err){
                         reject(err.code);
                    }
                    else{
                         let links=[];
                         const renderer = new marked.Renderer();
                         renderer.link = function(href, title, text){
                         links.push({
                              href:href, 
                              text: text,
                              file: path
                         })
                         }
                         marked(content,{renderer:renderer});
                         resolve(links);
                    }
               })  
          })
    
}
// funcion para encontrar y extraer archivos con extencion .md de un directorio
const extractMdFiles = (path) =>{
     return new Promise((resolve, reject)=>{
          let mdFiles = fileHound.create()
          .paths(path)
          .ext('md') 
          .find()
          resolve(mdFiles)
     })
}

const linksToStatsAndValidate = (links)=>{
     return Promise.all(links.map(link=>{
          return new Promise((resolve, reject)=>{
               fetch(link.href)
                    .then(res=>{
                         if(res.status<200||res.status>400){
                              link.statusCode = res.status;
                              link.statusText = "fail"; 
                              resolve(link)  
                         }else{
                              link.statusCode = res.status;
                              link.statusText = res.statusText;               
                              resolve(link)
                         }
                    })
                    .catch((err)=>{
                         if(err){
                              link.statusCode = 0;
                              link.statusText = "fail";
                              resolve(link)
                         }
                    })
          })
     }))
 
} 

// opcion stats para contar y mostrar en consola links unicos y totales
const statsLinks = (links) =>{
     //console.log(links)
     return new Promise((resolve, reject)=>{
          linkStats = {} 
          const linksHref = links.map(el=>el.href);
          let totalLinks = linksHref.length;
          let uniqueLinks = [...new Set(linksHref)].length;
          linkStats.total = totalLinks;
          linkStats.unique = uniqueLinks;
          let linksBroken = links.filter(link=>{
               if(link.statusText === "fail"){
                    return link.statusText
               }
          });
          linksBroken=linksBroken.length;
          linkStats.broken = linksBroken;
          resolve(linkStats)
     })
} 
const mdLinks = (path, options) => {
     return new Promise ((resolve, reject) => {
          extractMdFiles(path)
               .then((mdFiles)=>{
                    Promise.all(mdFiles.map((mdFile)=>{
                         return links(mdFile)
                    })).then((linksInDir)=>{
                         let arrayWithArraysOfLinks = linksInDir;
                         let newArraySimple = [].concat.apply([],arrayWithArraysOfLinks);
                         if(options.stats&&options.validate||(options.validate===true)){
                              resolve(linksToStatsAndValidate(newArraySimple))
                         }else if((options.stats===true&&options.validate===false)||(options.stats===false&&options.validate===false)){
                              resolve(newArraySimple)
                         }
                    })
               })
               .catch(()=>{
                    links(path)
                         .then((links)=>{
                              if((options.validate&&options.stats)||options.validate){
                                   resolve(linksToStatsAndValidate(links))
                              }else if((options.stats===true&&options.validate===false)||(options.stats===false&&options.validate===false)){
                                   resolve(links)
                              }
                         })
                         .catch(err=>{
                              reject("la ruta no es directorio, ni archivo, intenta con ruta correcta",err)
                         })
               })
          })
}
//exportar funcion md-links y statsLinks
module.exports = {
  mdLinks,
  statsLinks,
  links,
  extractMdFiles,
  linksToStatsAndValidate
}



