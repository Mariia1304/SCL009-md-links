const pathNode = require('path');
const marked = require('marked');
const fs = require('fs');
const fileHound = require('filehound');
const fetch = require('node-fetch');

const isDirectory = (path) => {
     return new Promise ((resolve, reject) => {
          fs.lstat(path, (err, stats) => {
               if(err){
                    if(err.code == 'ENOENT'){
                         reject(console.log("ruta no valida"));
               }
               } else if (stats.isDirectory()){
                    extractMdFiles(path)
                         .then(res=>{
                              resolve(res)
                         })
                    .catch(err => {
                         reject(err)
                    })
         
               } else {
                    links(path)
                         .then(res=>{
                              resolve(res)
                         })
                         .catch(err => {
                         reject(err)
                         })
               }
          })
     })
};



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
          fileHound.create()
          .paths(path)
          .ext('md') 
          .find()
          .then(mdFiles=>{
               mdFiles.forEach(el => {
                    resolve(links(el))
               })
               
          })
          .catch(err => {
               reject(err)
          })
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
const callLinksToStatsAndValidate = (path)=>{
     return new Promise ((resolve, reject) => {
          isDirectory(path)
               .then(res=>{
                    linksToStatsAndValidate(res)
                         .then(res=>{
                              resolve(res)
                         })
                         .catch(err => {
                              reject(err)
                         })
               })
               .catch(err => {
                    reject(err)
               })
     })
}
//mostrar la informacion sobre links en caso si usuario no pusa opcion stats o validate
const simpleLinks = (links)=>{
     return new Promise((resolve, reject)=>{
          let linksValidate = links.map(link=>`\n${link.file} ${link.href} ${link.text}`);
            resolve(`${linksValidate}`)
     })
}
// opcion stats para contar y mostrar en consola links unicos y totales
const statsLinks = (links) =>{
     return new Promise((resolve, reject)=>{
          const linksHref = links.map(el=>el.href);
          let totalLinks = linksHref.length;
          const uniqueLinks = [new Set(linksHref)].length;
          resolve(`Links Totales: ${totalLinks},\nLinks Unicos: ${uniqueLinks}`)
     })
     
   } 
// opcion validate para mostrar en consola datos completos sobre link
const validateLinks = (links)=>{
     return new Promise((resolve, reject)=>{
          let linksValidate = links.map(link=>`\n${link.file} ${link.href} ${link.statusCode} ${link.statusText} ${link.text}`);
          resolve(`${linksValidate}`)

          
     })
}
// contar y mostrar links unicos totales y tambien los rotos(malos)
const validateAndStatsLinks = (links)=>{
     return new Promise((resolve, reject)=>{
          let linksTotal = links.map(link=>link.href);
          let linksTotales = linksTotal.length;
          let linksUnique = [new Set(linksTotal)].length;
          let linksBroken = links.filter(link=>{
               link.statusCode < 200 || link.statusCode > 400
               });
          linksBroken=linksBroken.length;
          
          resolve(`Links Totales: ${linksTotales},\nLinks Unicos: ${linksUnique},\nLinks Rotos: ${linksBroken}`)
     })
      
}
   

const mdLinks = (path, options) => {
     return new Promise ((resolve, reject) => {
          callLinksToStatsAndValidate(path)
               .then(res=>{
                    if(options.validate&&options.stats){
                         validateAndStatsLinks(res)
                              .then(res=>{
                                   resolve(res)
                              })
                             
                    }else if(options.validate){
                         validateLinks(res)
                              .then(res=>{
                                   resolve(res)
                              })
                             
                    }else if(options.stats){
                         statsLinks(res)
                              .then(res=>{
                                   resolve(res)
                              })
                             
                    }else{
                         simpleLinks(res)
                              .then(res=>{
                                   resolve(res)
                              })
                              
                    }
               })
               .catch(err=>{
                    reject(err)
               })
      
     })
}
//exportar funcion md-links
module.exports = {
  mdLinks
}



