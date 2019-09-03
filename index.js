#!/usr/bin/env node
const mdLinks = require('./md-links.js');
const chalk = require('chalk'); // modulo personaliza los mensajes 

// path Ruta absoluta o relativa al archivo o directoriomd-links <path-to-file> [options]
let path = process.argv[2] // es una matriz que contiene los argumentos de la línea de comandos

let options = {
  stats: false,
  validate: false,
}

process.argv.forEach(element =>{
 if( element == "--stats"){
   options.stats = true
 }
if(element == "--validate"){
  options.validate = true
}
})

mdLinks.mdLinks(path,options).then(res=>{
  if(options.validate && options.stats){
    return console.log(chalk.yellow("Total Links: "+ res.total)+"\n"+chalk.green("Ok Links: "+res.ok)+"\n"+chalk.red("Broken Links: "+res.broken))
  }
  
    }
)

