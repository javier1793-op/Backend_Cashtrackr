import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { param , body} from "express-validator";
import Budget from '../models/Budget';

declare global{
    namespace Express{
        interface Request{
            budget?: Budget
        }
    }
}

export const budgetsId = async(req: Request, res: Response, next: NextFunction) =>{
 
    await param('BudgetId')
         .isInt().withMessage('Id no valido')
         .custom(value => value > 0).withMessage('Id no valido').run(req)
 
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

export const validateBudgetExists = async(req: Request, res: Response, next: NextFunction) =>{
    try {
            const {BudgetId} = req.params
            const bugdet = await Budget.findByPk(BudgetId)
            if(!bugdet){
                const error = new Error('Presupuesto no encontrado')
                return res.status(404).json({error: error.message})
            }
            req.budget= bugdet
            next()
        } catch (error) {
             //console.log(error)
            res.status(500).json({error:'hubo un error'})
        }
}

export const validateBudgetInput = async(req: Request, res: Response, next: NextFunction) =>{
        await body('name')
            .notEmpty().withMessage('El nombre del presupuesto no puede ir vacio').run(req)
        await body('amount')
            .notEmpty().withMessage('La cantindad del presupuesto no puede ir vacio')
            .isNumeric().withMessage('Cantidad no valida')
            .custom(value => value > 0).withMessage('El presupuesto debe ser mayor a cero').run(req)
    next()
}

export const hasAccess = async(req: Request, res: Response, next: NextFunction) =>{
    
    if(req.budget.userId !== req.user.id){
        const error= new Error('accion no valido')
        return res.status(401).json({error:error.message})
    }
    next()
}