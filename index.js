#!/usr/bin/env node
const mdLinks = require('./src/md-links.js');
const pathNode = require('path');
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


 mdLinks.mdLinks(userPath, options);
   

