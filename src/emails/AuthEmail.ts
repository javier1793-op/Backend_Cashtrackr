import { transport } from "../config/nodemailer"

type EmailType ={
    name:string,
    email:string,
    token:string
}

export class AuthEmail{
    static sendConfirmationEmail = async (user: EmailType)=>{
        const email= await transport.sendMail({
            from:"Cashtrakr <admin@cashtrackr.com",
            to:user.email,
            subject:'Cashtrackr - confirmar email',
            html:`<p> Hola: ${user.name}, has creado tu cuenta en Cashtrackr, ya esta casi listo</p>
            <p> Visita el siguente enlace:</p>
            <a href="#"> Confirmar cuenta</a>
            <p> ingresa el código:<b> ${user.token}</b></p>`
        })
    }

     static resetPasswordToken = async (user: EmailType)=>{
        const email= await transport.sendMail({
            from:"Cashtrakr <admin@cashtrackr.com",
            to:user.email,
            subject:'Cashtrackr - Restablecer contraseña',
            html:`<p> Hola: ${user.name}, has solicitado reestablecer contraseña</p>
            <p> Visita el siguente enlace:</p>
            <a href="#"> Reestablecer contraseña</a>
            <p> ingresa el código:<b> ${user.token}</b></p>`
        })
    }

}