const fs = require('fs'); //proporciona una API para interactuar con el sistema de archivos 
const FileHound = require('filehound'); // biblioteca Buscará recursivamente un directorio determinado



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
