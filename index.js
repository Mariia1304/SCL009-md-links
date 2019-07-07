#!/usr/bin/env node
const mdLinks = require('./src/md-links.js'); // conectemonos con la pagina md-links.js
const pathNode = require('path'); //modulo path de node para hacer algunos manipulaciones con la ruta
const colors = require('colors'); // libreria de colores para terminal

let userPath = process.argv[2];// aquí guardamos en una variable la ruta que engreso usuario 
userPath = pathNode.resolve(userPath);// aqui la vamos a convertir en absoluta    
userPath = pathNode.normalize(userPath);// y aqui la vamos a normalizar
let options = {
     stats: false,
     validate: false
} //creamos una variable options que va a ser un objeto con dos propiedades, que pueden tener valor en booleano
let firstOption = process.argv[3];
let secondOption = process.argv[4];

if(firstOption ==="--validate" && secondOption === "--stats"||firstOption==="--stats" && secondOption === "--validate"||firstOption ==="--v" && secondOption === "--s"||firstOption==="--s" && secondOption === "--v"){
     options.validate = true;
     options.stats = true;
}else if(firstOption==="--stats"|| firstOption === "--s"){
     options.stats = true;
     options.validate = false;
}else if(firstOption==="--validate"|| firstOption === "--v"){
     options.validate = true;
     options.stats = false;
}//aqui ponemos reglas en cuales casos va a cambiarse el valor de propiedades

 mdLinks.mdLinks(userPath, options)//aqui llamamos nuestra funcion-promesa mdLinks que está en otro archivo
    .then(res=>{
         if(options.stats&&options.validate){
              mdLinks.statsLinks(res)
                    .then(res=>{
                         console.log(("Links totales: ").green,(`${res.total}`).magenta,("\nLinks unicos: ").yellow, (`${res.unique}`).magenta, ("\nLinks rotos: ").red, (`${res.broken}`).magenta)
                    })
         }else if(options.stats){
              mdLinks.statsLinks(res)
                    .then(res=>{
                         console.log(("Links totales: ").green,(`${res.total}`).magenta,("\nLinks unicos: ").yellow, (`${res.unique}`).magenta)
                    })
         }else if(options.validate){
              res.forEach(el=>{
                   console.log((`${el.file}`).green, (`${el.href}`).yellow,(`${el.statusCode}`).magenta,(`${el.statusText}`).cyan,(`${el.text}`).italic)
              })
         }else{
              res.forEach(el=>{
                   console.log((`${el.file}`).green, (`${el.href}`).yellow,(`${el.text}`).italic)
              })
         }
    })
    .catch(err =>{
         console.log("Hay un error por aquí: ",err)
    })
     


