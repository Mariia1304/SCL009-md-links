const pathNode = require('path');
const marked = require('marked');
const fs = require('fs');
const fileHound = require('filehound');
const fetch = require('node-fetch');

// funcion que lee archivo y extrae los links como un array de objetos
const links = (path) =>{
          return new Promise((resolve,reject)=>{
               
               if(pathNode.extname(path)!=".md"){
                    reject("Extensión no válida");// obtener error en caso si la extenxion de archivo no es .md
               }
               fs.readFile(path,'utf-8',(err, content)=>{
                    if(err){
                         reject(err.code);//algun error en funcion readFile
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
     return new Promise((resolve, reject)=>{//TODO agregar reject como por ejemplo en caso si directorio no tiene archivos .md
          let mdFiles = fileHound.create()
          .paths(path)
          .ext('md') 
          .find()
          resolve(mdFiles)
     })
}
// esta funcion valida los links que les pasamos como array de objetos TODO: cambiar el nombre de funcion
const linksToStatsAndValidate = (links)=>{
     return Promise.all(links.map(link=>{
          return new Promise((resolve, reject)=>{//TODO agregar reject, como?
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
                         }else{
                              reject(err.code)
                         }
                    })
          })
     }))
 
} 

// funcion que nos guarda estadisticas sobre los links
const statsLinks = (links) =>{
     //console.log(links)
     return new Promise((resolve, reject)=>{
          linkStats = {} // objeto donde vamos a guardar estadisticas
          const linksHref = links.map(el=>el.href);//array de href de los links
          let totalLinks = linksHref.length;//largo de este array que nos da la cantidad de links total
          let uniqueLinks = [...new Set(linksHref)].length;// con metodo(??) new set obtenemos el array con elementos unicos, y su largo nos da la cantidad de los links unicos
          linkStats.total = totalLinks;//guardamos los links totales en objeto  
          linkStats.unique = uniqueLinks;//guardamos los links unicos en objeto
          let linksBroken = links.filter(link=>{
               if(link.statusText === "fail"){
                    return link.statusText//aqui si filtremos por statusTex=fail obtenemos los links rotos
               }
          });
          linksBroken=linksBroken.length;//y aqui sacamos el largo de este array
          linkStats.broken = linksBroken;//guardamos esta cantidad en objetolinkStats
          resolve(linkStats)// resolve de la funcion sera esta objeto
     })
} 
//funcion md-links que conecta los otras funciones del archivo para obtener al final el array de los links que podemos usar en index.js
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
               .catch((error)=>{
                    if(error.code==="ENOENT"){
                         reject("No es un directorio")
                    }
                    if(pathNode.extname(path)!=".md"){
                         reject("extencion no valida")
                    }
                    links(path)
                         .then((links)=>{
                              if((options.validate&&options.stats)||options.validate){
                                   resolve(linksToStatsAndValidate(links))
                              }else if((options.stats===true&&options.validate===false)||(options.stats===false&&options.validate===false)){
                                   resolve(links)
                              }
                         })
                         .catch(err=>{
                              reject(err)
                         })
               })
          })
}
//exportar funcion md-links y statsLinks         // y otras tambien para testear  //TODO analizar imagenes
module.exports = {
  mdLinks,
  statsLinks,
  links,
  extractMdFiles,
  linksToStatsAndValidate
}



