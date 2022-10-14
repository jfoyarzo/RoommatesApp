//Importación de módulo nodemailer
const nodemailer = require('nodemailer')

//Función asíncrona para enviar correo
let enviar = async(correos, gasto) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'jsfs.dev@gmail.com',
            pass: 'clave1234',
        },
    })
    let mailOptions = {
        from: 'jsfs.dev@gmail.com',
        to: ['jsfs.dev@gmail.com'].concat(correos),
        subject: `Nuevo gasto registrado del roommate ${gasto.roommate}`,
        html: `<h4>Hola!</h4>
        <p>Te escribimos para contarte que el roommate ${gasto.roommate} ha registrado un gasto de $${gasto.monto} por concepto de ${gasto.descripcion}</p><br><h5>Saludos!</h5>`,
    }
    try{
        let res = await transporter.sendMail(mailOptions)
        return res
    }catch(e){
        throw e
    }
}

//Exportación del módulo con la función para enviar el correo
module.exports = {enviar}