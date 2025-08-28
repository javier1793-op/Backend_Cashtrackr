import { Request, Response, NextFunction } from 'express'
import { param , body, validationResult} from "express-validator";
import Expense from '../models/Expense';

declare global{
    namespace Express{
        interface Request{
            expense?: Expense
        }
    }
}

export const validateExpenseInput = async(req: Request, res: Response, next: NextFunction) =>{
        await body('name')
            .notEmpty().withMessage('El nombre del gasto no puede ir vacio').run(req)
        await body('amount')
            .notEmpty().withMessage('La cantindad del gasto no puede ir vacio')
            .isNumeric().withMessage('Cantidad no valida')
            .custom(value => value > 0).withMessage('El gasto debe ser mayor a cero').run(req)
    next()
}

export const expenseId = async(req: Request, res: Response, next: NextFunction) =>{
 
    await param('ExpenseId')
         .isInt().withMessage('Id no valido')
         .custom(value => value > 0).withMessage('Id no valido').run(req)
 
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

export const validateExpenseExists = async(req: Request, res: Response, next: NextFunction) =>{
    try {
            const {ExpenseId} = req.params
            const expense = await Expense.findByPk(ExpenseId)
            if(!expense){
                const error = new Error('Gasto no encontrado')
                return res.status(404).json({error: error.message})
            }
            req.expense= expense
            next()
        } catch (error) {
             //console.log(error)
            res.status(500).json({error:'hubo un error'})
        }
}