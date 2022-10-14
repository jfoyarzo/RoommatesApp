
//Importación de módulos de Node
const axios = require('axios')
const {v4: uuidv4} = require('uuid')
const fs = require('fs')

//Función asíncrona para obtener usuario de randomuser
const agregaUsuario = async () => {
    try {
        const {data} = await axios.get('https://randomuser.me/api')
        const user = data.results[0]
        const newUser = {
            id: uuidv4().slice(30),
            nombre: `${user.name.first} ${user.name.last}`,
            correo: user.email,
            debe: Math.floor(Math.random() * 10000),
            recibe: Math.floor(Math.random() * 10000)                  
        }
        return newUser
    }
    catch (e) {
        throw e
    }
}

//Función para guardar los usuarios en el archivo JSON
const guardaUsuario = (usuario) =>{
    let usuariosJSON = JSON.parse(fs.readFileSync('roommates.json', 'utf-8'))
    usuariosJSON.roommates.push(usuario)
    fs.writeFileSync('roommates.json', JSON.stringify(usuariosJSON))
}

//Exportación de módulos para obtener y guardar usuarios
module.exports = {agregaUsuario, guardaUsuario}