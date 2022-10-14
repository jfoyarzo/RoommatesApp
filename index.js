//Importación de módulos de Node
const http = require('http')
const fs = require('fs')
const url = require('url')
const { v4: uuidv4 } = require('uuid')

//Importación de funciones para agregar y guardar usuarios random
const { agregaUsuario, guardaUsuario } = require('./usuario')

//Importación de función para enviar los correos
const { enviar } = require('./mailer')


//Creación del servidor
http.createServer((req, res) => {
    //Inicialización de variables mediante la lectura del archivo 'gastos.json'
    let gastosJSON = JSON.parse(fs.readFileSync("gastos.json",
        "utf8"))
    let gastos = gastosJSON.gastos
    //Habilitación de la ruta raíz que devuelve el contenido del archivo 'index.html
    if (req.url == '/' && req.method == 'GET') {
        try {
            res.setHeader('content-type', 'text/html')
            res.end(fs.readFileSync('index.html', 'utf-8'))
            res.statusCode = 200
        } catch (e) {
            res.statusCode = 500
            res.end()
            console.log('ERROR ---> ' + e)
        }
    }

    //Habilitación de ruta para agregar roommate
    if (req.url.startsWith('/roommate') && req.method == 'POST') {

        agregaUsuario().then(async (usuario) => {
            guardaUsuario(usuario)
            res.end(JSON.stringify(usuario))
            res.statusCode = 201
        })
            .catch((e) => {
                res.statusCode = 500
                res.end()
                console.log('ERROR ---> ' + e)
            })

    }

    //Habilitación de ruta GET para los roommates
    if (req.url.startsWith("/roommates") && req.method == "GET") {
        res.setHeader("Content-Type", "application/json");
        fs.readFile("roommates.json", "utf8", (err, roommates) => {
            if (err) (res.statusCode = 500), res.end()
            res.end(roommates)
            res.statusCode = 200
        });
    }

    //Habilitación de ruta GET para los gastos
    if (req.url.startsWith("/gastos") && req.method == "GET") {
        res.setHeader("Content-Type", "application/json")
        fs.readFile("gastos.json", "utf8", (err, gastos) => {
            if (err) (res.statusCode = 500), res.end()
            res.end(gastos)
            res.statusCode = 200
        });
    }

    //Habilitación de ruta para registrar nuevos gastos (POST)
    if (req.url.startsWith("/gasto") && req.method == "POST") {

        let body

        req.on("data", (payload) => {
            body = JSON.parse(payload)
        })

        req.on("end", () => {

            let gasto = {
                id: uuidv4().slice(30),
                roommate: body.roommate,
                descripcion: body.descripcion,
                monto: body.monto
            };
            gastos.push(gasto)
            let users = JSON.parse(fs.readFileSync('roommates.json', 'utf8')).roommates
            let correos = users.map((e) => e.correo)

            fs.writeFile("gastos.json",
                JSON.stringify(gastosJSON), (err, data) => {
                    if (err) {
                        res.statusCode = 500
                        res.end()
                        console.log('ERROR ---> ' + err)
                    }
                    enviar(correos, gasto).then(() => {

                        res.end()
                        res.statusCode = 201
                    }).catch((e) => {
                        res.statusCode = 500
                        res.end()
                        console.log('ERROR ---> ' + e)
                    })
                })

        })
    }

    //Habilitación de ruta para modificar gastos(PUT)
    if (req.url.startsWith("/gasto") && req.method == "PUT") {
        const { id } = url.parse(req.url, true).query
        let body
        req.on("data", (payload) => {
            body = JSON.parse(payload);
        })
        req.on("end", () => {

            gastosJSON.gastos = gastos.map((b) => {
                if (b.id == id) {
                    let gasto = {
                        id: id,
                        roommate: body.roommate,
                        descripcion: body.descripcion,
                        monto: body.monto
                    }
                    return gasto
                }
                return b
            })
            fs.writeFile("gastos.json",
                JSON.stringify(gastosJSON), (err, data) => {
                    if (err) {
                        res.statusCode = 500
                        res.end()
                        console.log('ERROR ---> ' + err)
                    }
                    res.end()
                    res.statusCode = 201
                })

        })
    }

    //Habilitación de ruta para borrar gastos
    if (req.url.startsWith("/gasto") && req.method == "DELETE") {

        const { id } = url.parse(req.url, true).query

        gastosJSON.gastos = gastos.filter((b) => b.id !== id);

        fs.writeFile("gastos.json",
            JSON.stringify(gastosJSON), (err, data) => {
                if (err) {
                    res.statusCode = 500
                    res.end()
                    console.log('ERROR ---> ' + err)
                }
                res.end()
                res.statusCode = 200
            })

    }
})
    .listen(3000, () => console.log('Servidor up'))