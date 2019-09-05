const fs = require('fs'); //proporciona una API para interactuar con el sistema de archivos 
const FileHound = require('filehound'); // biblioteca Buscará recursivamente un directorio determinado
const marked = require('marked');

//path = Especifica la parte de la ruta o la URL que manejará la devolución de llamada dada.



//leer arhivo de directorio
const readingPath = (path =>{
    return new Promise((resolve,reject)=>{
      FileHound.create() // buscara un directorio determinado
      .paths(path)
      .ext('.md')
      .find()
      .then(files=>{
      if(files.length != 0){
      resolve(files)}
      reject(new Error("No se encontraron archivos .md "+path))
    }).catch(err=>{
      reject(new Error("Invalida"))
    })
  })
})

//leer archivo.md
const read = (path => {
    return new Promise((resolve,reject)=>{
      fs.readFile( path,'utf8', (err, data) => {
        if (err){
          reject(err("archivo no encontrado"+path))
        }
        resolve(data)
      })
    })
  })

  //lee los archivos y extrae links de un archivo .md
  const extractLinks = (path =>{
    return new Promise((resolve, reject)=>{
      fs.readFile(path, 'utf-8', (err, data) => {
        if (err) {
          reject(err);
        }
        let links = [];
        const renderer = new marked.Renderer();
        renderer.link = function(href,title,text){
            links.push({
              href:href,
              text:text,
              file:path})
          }
        
          marked(data,{
              renderer:renderer
         }) 
          
          resolve(links)
          
      }).catch(err=>{
        reject(err)
        })
    })
})
 // entrega  links totales, links OK y links rotos.

 const statsAndValidateLinks = (links) =>{
    return new Promise((resolve,reject)=>{
      urlValidate(links).then(links=>{
        const statusLinks = links.map(x=>x.status)
        let okLinks = statusLinks.toString().match(/200/g)
        const totalLinks = links.length
        let brokenLinks = 0
  
        if(okLinks != null){
          okLinks = okLinks.length
        }else{
          okLinks =  0
        }
        
        brokenLinks = totalLinks-okLinks
        resolve({
          total:totalLinks,
          ok: okLinks,
          broken:brokenLinks})
      }).catch(err=>{
        reject(err)
      })
    })
   }
//valida cada link y agrega "status" a cada uno segun respuesta del fetch
const validateLinks = (path) =>{
  return new Promise((resolve, reject) => {
    fileOrDirectoryLinks(path).then(links =>{ 
    
      let fetchLinks = links.map(x=>{  
        
        return fetch(x.href).then(res =>{
            x.status = res.status+" "+res.statusText
          }).catch((err)=>{
            x.status = err.code
          }) 
      })
      
      Promise.all(fetchLinks).then(res=>{
        resolve(links)
      })
      
    }).catch(err=>{
      reject(err)
    })
  })
}

//stats de cada link 
const statsLinks = (path) =>{
return new Promise((resolve, reject) => { 
  fileOrDirectoryLinks(path).then(links =>{
    const uniqueLinks = new Set(links.map(x=>x.href))
    resolve({total:links.length,
      unique:uniqueLinks.size})
    }).catch(err=>{
      reject(err)
    })
  })
}
//
const mdLinks = (path, options) =>{
  if(!path || !options){
    return new Promise((resolve,reject)=>{
      reject(new Error ("Faltan argumentos"))
    })
  }
  if(options.stats && options.validate){
    return statsAndValidateLinks(path)
  }  
  if(options.stats){
    return statsLinks(path)
  }if(options.validate){
    return validateLinks(path)
  }else{
    return fileOrDirectoryLinks(path)}
  }

module.exports = {
  mdLinks 
}

//aqui se elige que opcion desea ejecutar si validate o stats 

const mdLinks = (args) => {

let path = process.argv[2]

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
    return console.log(chalk.magenta("Total Links: "+ res.total)+"\n"+chalk.green("Ok Links: "+res.ok)+"\n"+chalk.red("Broken Links: "+res.broken))
  }
  if(options.validate){
    if(res.length === 0){
      return console.log(chalk.red("No se encontraron links"))
    }
    let validateLinks = res.map(x=>x.file+"  "+chalk.blue(x.href)+"  "+chalk.cyan(x.text.substr(0,40))+"  "+x.status)
    return console.log(validateLinks.join("\n "))
  }
  if(options.stats){
    return console.log(chalk.magenta("Total Links: "+ res.total)+"\n"+chalk.yellow("Unique Links: "+res.unique))
  }else{
    if(res.length === 0){
      return console.log(chalk.red("No se encontraron links"))
    } 
    const resLinks = res.map(x=>x.file+"  "+chalk.blue(x.href)+"  "+chalk.cyan(x.text.substr(0,40)))
    return console.log(resLinks.join("\n "))
  }
}).catch(err=>{
  console.log(chalk.red(err.message))
});
}


