#!/usr/bin/env node
const mdLinks = require('./md-links.js');
const process = require('process');
const pathMd = require('path');
const chalk = require('chalk');



let path = process.argv[2]  
// path Ruta absoluta o relativa al archivo 
path = pathMd.resolve(path);
//para convertir en absoluta

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
    return console.log(chalk.yellow("Total Links: " + res.total) + "\n" + chalk.green("Ok Links: " + res.ok) +"\n" + chalk.red("Broken Links: " + res.broken))
  }
  if(options.validate){
    if(res.length === 0){
      return console.log(chalk.red("No se encontraron links"))
    }
    let validateLinks = res.map(element => chalk.blue(element.file) + "  " + chalk.green(element.href)  +" " + chalk.magenta (element.status) + " "  + chalk.green(element.statusCode))
    return console.log(validateLinks.join("\n "))
  }
  if(options.stats){
    return console.log(chalk.magenta("Total Links: "+ res.total) + "\n" + chalk.yellow("Unique Links: "+res.unique));
  }else{
    if(res.length === 0){
      return console.log(chalk.red("No se encontraron links"))
    } 
    const resLinks = res.map(element => element.file + "  " + chalk.blue(element.href) )
    return console.log(resLinks.join("\n "))
  }
}).catch(err=>{
  console.log(chalk.red(err.message))
});





