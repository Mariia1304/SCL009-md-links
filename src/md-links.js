const pathNode = require('path');
const marked = require('marked');
const fs = require('fs');
const fileHound = require('filehound');
const fetch = require('node-fetch');
const colors = require('colors')

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
//mostrar la informacion sobre links en caso si usuario no pusa opcion stats o validate
const simpleLinks = (links)=>{
     return new Promise((resolve, reject)=>{
          let linksValidate = links.map(link=>(`${link.file}`).green+(` ${link.href}`).yellow+(` ${link.text}`).blue+`\n`)
            resolve(`${linksValidate}`)
     })
}
// opcion stats para contar y mostrar en consola links unicos y totales
const statsLinks = (links) =>{
     return new Promise((resolve, reject)=>{
          const linksHref = links.map(el=>el.href);
          let totalLinks = linksHref.length;
          let uniqueLinks = [...new Set(linksHref)].length;
          resolve((`Links Totales: `).green+(`${totalLinks}`).yellow+(`\nLinks Unicos: `).blue+(`${uniqueLinks}`).yellow)
     })
} 
// opcion validate para mostrar en consola datos completos sobre link
const validateLinks = (links)=>{
     return new Promise((resolve, reject)=>{
          let linksValidate = links.map(link=>(`${link.file}`).green+(` ${link.href}`).yellow+(` ${link.statusCode}`).blue+(` ${link.statusText}`).cyan+(` ${link.text}`).magenta+"\n");
          resolve(`${linksValidate}`)
         
     })
}
// contar y mostrar links unicos totales y tambien los rotos(malos)
const validateAndStatsLinks = (links)=>{
     return new Promise((resolve, reject)=>{
          let linksTotal = links.map(link=>link.href);
          let linksTotales = linksTotal.length;
          let linksUnique = [...new Set(linksTotal)].length;
          let linksBroken = links.filter(link=>{
               link.statusCode < 200 || link.statusCode > 400
               });
          linksBroken=linksBroken.length;
          resolve(("Links Totales: ").green +(`${linksTotales}`).yellow+"\n"+("Links Unicos: ").blue +(`${linksUnique}`).yellow+"\n"+("Links Rotos: ").red+(`${linksBroken}`).yellow)
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
                              resolve(linksToStatsAndValidate(linkInDir))
                         }else if((options.stats===true&&options.validate===false)||(options.stats===false&&options.validate===false)){
                              resolve(newArraySimple)
                         }
                         //resolve(newArraySimple)
                         // Promise.all(linksInDir.map((linkInDir)=>{
                         //      return linksToStatsAndValidate(linkInDir)
                         //}
                        // )).then((links)=>{




                              // let arrayWithArraysOfLinks = links;
                              // let newArraySimple = [].concat.apply([],arrayWithArraysOfLinks);
                              // resolve(newArraySimple)
                              // if(options.validate&&options.stats){
                              //      validateAndStatsLinks(newArraySimple)
                              //           .then(res=>{
                              //               resolve(res)
                              //           })
                              // }else if(options.validate){
                              //      validateLinks(newArraySimple)
                              //           .then(res=>{
                              //                resolve(res)
                              //           })
                              // }else if(options.stats){
                              //      statsLinks(newArraySimple)
                              //           .then(res=>{
                              //                resolve(res)
                              //           })
                              // }else(
                              //      simpleLinks(newArraySimple)
                              //           .then(res=>{
                              //                resolve(res)
                              //           })
                              // )
                         //})
                         // .catch(err=>{
                         //      console.log(err)
                         // })
                    })
               })
               .catch(()=>{
                    links(path)
                         .then((links)=>{
                              linksToStatsAndValidate(links)
                                   .then((links)=>{
                                        if((options.validate&&options.stats)||options.validate){
                                             resolve(validateAndStatsLinks(links))
                                        }else if((options.stats===true&&options.validate===false)||(options.stats===false&&options.validate===false)){
                                             resolve(links)
                                        }
                                        
                                        // if(options.validate&&options.stats){
                                        //      resolve(validateAndStatsLinks(links))
                                        // }else if(options.validate){
                                        //      resolve(validateLinks(links))
                                        // }else if(options.stats){
                                        //      resolve(statsLinks(links))      
                                        // }else{
                                        //      resolve(simpleLinks(links))
                                        // }
                                   })
                                   .catch(err=>{
                                        resolve(err)
                                   }) 
                         .catch(err=>{
                              resolve("links",err)
                         })
                                      
                      })

               })
              
     })
}
//exportar funcion md-links
module.exports = {
  mdLinks
 
}



