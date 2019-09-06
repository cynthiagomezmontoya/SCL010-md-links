const fs = require('fs'); //proporciona una API para interactuar con el sistema de archivos 
const FileHound = require('filehound'); // biblioteca Buscará recursivamente un directorio determinado
const marked = require('marked');
const fetch = require('node-fetch');

//path = Especifica la parte de la ruta o la URL que manejará la devolución de llamada dada.



//leer arhivo de directorio FileHound encontrar archivos dentro de un directorio
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
const readMd = (path => {
    return new Promise((resolve,reject)=>{
      fs.readFile( path,'utf8', (err, data) => {
        if (err){
          reject(new err("archivo no encontrado" +path))
        }
        resolve(data)
      })
    })
  })

  //lee los archivos y extrae links de un archivo .md
  const extractLinks = (path =>{
    return new Promise((resolve, reject)=>{
      readMd(path).then(res => {
      
        let links = [];
        const renderer = new marked.Renderer();
        renderer.link = function(href,title,text){
            links.push({
              href:href,
              text:text,
              file:path})
          }
        
          marked(res,{
              renderer:renderer});
         resolve(links)
            
      }).catch(err=>{
        reject(err)
        })
    })
})

//  arreglo con informacion de los links dentro del directorio
const findInDirectory = (files) =>{
  return new Promise((resolve, reject)=>{
    let count = 0;
    let allLinks = []
    files.forEach(element => {
      extractLinks(element).then(singleLink =>{
        count++
        allLinks = allLinks.concat(singleLink)
        if(count == files.length){
          resolve(allLinks)
        }
      }).catch(err=>{
          reject(err)
        })
    })
  })
}

// comprueba true si el archivo es .md 
const isMd = (path =>{
  if(path.slice(-3)== ".md"){
    return true;
  }
  return false;
})


//comprobar si path es archivo o directorio
const fileOrDirectory = (path) => {
   //checkea si es archivo MD
  if(isMd(path)){
    return extractLinks(path)
  }
   //si es directorio
  else {
      return new Promise((resolve, reject) => { 
        readingPath(path)
        .then(files => {
          findInDirectory(files)
          .then(links => {
            resolve(links)
          })
        }).catch(err =>{
          reject(new Error(err.message))
        })
      })
    }
  }

 // entrega  links totales, links OK y links rotos.

 const statsAndValidateLinks = (path) =>{
    return new Promise((resolve,reject)=>{
      validateLinks(path).then(links=>{
        const statusLinks = links.map(element => element.status)
        let okLinks = statusLinks.toString().match(/200/g)
        const totalLinks = links.length
        let brokenLinks = 0
  
        if(okLinks != null){
          okLinks = okLinks.length
        }else{
          okLinks =  0
        }
        
        brokenLinks = totalLinks - okLinks
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
const validateLinks = (path) => {
  return new Promise((resolve, reject) => {
    fileOrDirectory(path).then(links =>{ 
    let fetchLinks = links.map(element => {  
        return fetch (element.href).then(res =>{
            element.statuscode = res.status;
            element.statu= res.statusText;
          })
            .catch((err)=>{
            element.status = err.code
          }) 
      })
      
      Promise.all(fetchLinks).then(res => {
        resolve(links)
      })
      
    })
       .catch(err=>{
        reject(err)
    })
  })
}

//stats de cada link 
const statsLinks = (path) =>{
return new Promise((resolve, reject) => { 
  fileOrDirectory(path)
   .then(links =>{
    const uniqueLinks = new Set(links.map(element=>element.href))
    resolve({total:links.length,
      unique : uniqueLinks.size})
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
  }
   if(options.validate){
    return validateLinks(path)
  }
   else{
    return fileOrDirectory(path)}
  }

module.exports = {
  mdLinks 
}
