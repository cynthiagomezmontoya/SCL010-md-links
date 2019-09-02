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