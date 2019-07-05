#!/usr/bin/env node
const mdLinks = require('./src/md-links.js');
const pathNode = require('path');
const colors = require('colors')

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
}else if(firstOption==="--stats"){
     options.stats = true;
     options.validate = false;
}else if(firstOption==="--validate"){
     options.validate = true;
     options.stats = false;
}

 mdLinks.mdLinks(userPath, options)
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
         }
    })
    .catch(err =>{
         console.log(err)
    })
     


