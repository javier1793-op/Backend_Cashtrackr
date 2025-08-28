import jwt from 'jsonwebtoken'

export const JWT = (id:string)=>{
    const token= jwt.sign({id},process.env.SECRET_JWT,{
        expiresIn: '30d'
    })
    return token
}