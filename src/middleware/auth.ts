import { Request, Response, NextFunction } from 'express'
import User from '../models/User'
import jwt from 'jsonwebtoken'

declare global{
    namespace Express{
        interface Request{
            user?: User
        }
    }
}

export const authenticate = async(req: Request, res: Response, next: NextFunction)=>{
 const bearer= req.headers.authorization
      if(!bearer){
        const error= new Error('No autorizado')
        return res.status(401).json({error:error.message})
      }
      const [ ,token]= bearer.split(' ')
      if(!token){
         const error= new Error('token no valido')
        return res.status(401).json({error:error})
      }
      try {
        const decode= jwt.verify(token,process.env.SECRET_JWT)
        if(typeof decode === 'object' && decode.id){
          req.user = await User.findByPk(decode.id,
            {attributes:['id','name', 'email']}
          )
          next()
        }
      } catch (error) {
        //console.log(error)
        res.status(500).json({error:'Token no valido'})
      }
}