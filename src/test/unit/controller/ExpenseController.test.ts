import {createResponse , createRequest} from 'node-mocks-http'
import Expense from '../../../models/Expense'
import { ExpensesController } from '../../../controllers/ExpensesController'
import { expenses } from '../../mocks/expense'

jest.mock('../../../models/Expense', ()=>({
    create: jest.fn()
}))

describe('ExpensesController.create',()=>{
    it('should create a new expense', async()=>{
        const expenseMock={
            save:jest.fn().mockResolvedValue(true)
        };
    
    (Expense.create as jest.Mock).mockResolvedValue(expenseMock)   
    
    const req= createRequest({
        method:'POST',
        url:'/api/budgets/:budgetId/expeses',
        body:{name:'test expense', amount:200},
        budget:{id:1}
    })
    const res= createResponse()

    await ExpensesController.create(req, res)

    const data= res._getJSONData()
    expect(res.statusCode).toBe(201)
    expect(data).toEqual('EL Gasto se creo correctamente')
    expect(expenseMock.save).toHaveBeenCalled()
    expect(expenseMock.save).toHaveBeenCalledTimes(1)
    expect(Expense.create).toHaveBeenCalledWith(req.body)
    })

     it('should handle expense creation error', async()=>{
        const expenseMock={
            save:jest.fn()
        };
    
    (Expense.create as jest.Mock).mockRejectedValue(new Error)   
    
    const req= createRequest({
        method:'POST',
        url:'/api/budgets/:budgetId/expeses',
        body:{name:'test expense', amount:200},
        budget:{id:1}
    })
    const res= createResponse()

    await ExpensesController.create(req, res)

    const data= res._getJSONData()
    expect(res.statusCode).toBe(500)
    expect(data).toEqual({error:'Hubo un error'})
    expect(expenseMock.save).not.toHaveBeenCalled()
    expect(Expense.create).toHaveBeenCalledWith(req.body)
    })

    
})

describe('ExpensesController.getById',()=>{
    it('should return expense with Id 1', async()=>{
         
    const req= createRequest({
        method:'GET',
        url:'/api/budgets/:budgetId/expeses/:expenseId',
        expense: expenses[0]
    })
    const res= createResponse()

    await ExpensesController.getById(req,res)

    expect(res.statusCode).toBe(200)
    })
})

describe('ExpensesController.updateById',()=>{
    it('should handle expense update', async()=>{
    
        const expenseMock={
            ...expenses[0],
            update:jest.fn().mockResolvedValue(true)
        }

    const req= createRequest({
        method:'PUT',
        url:'/api/budgets/:budgetId/expeses/:expenseId',
        expense: expenseMock,
        body:{name:'expese update', amount:20}
    })
    const res= createResponse()

    await ExpensesController.updateById(req,res)

    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toBe('Gasto actualizado correctamente')
    expect(expenseMock.update).toHaveBeenCalled()
    expect(expenseMock.update).toHaveBeenCalledTimes(1)
    })
})

describe('ExpensesController.deleteById',()=>{
    it('should delete expense ', async()=>{
    
        const expenseMock={
            ...expenses[0],
            destroy:jest.fn().mockResolvedValue(true)
        }

    const req= createRequest({
        method:'DELETE',
        url:'/api/budgets/:budgetId/expeses/:expenseId',
        expense: expenseMock,
    })
    const res= createResponse()

    await ExpensesController.deleteById(req,res)

    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toBe('Gasto eliminado')
    expect(expenseMock.destroy).toHaveBeenCalled()
    expect(expenseMock.destroy).toHaveBeenCalledTimes(1)
    })
})