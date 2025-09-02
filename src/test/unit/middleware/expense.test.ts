import { createRequest, createResponse } from "node-mocks-http"
import Expense from "../../../models/Expense"
import { expenses } from "../../mocks/expense"
import { validateExpenseExists } from "../../../middleware/expense"
import { budgets } from "../../mocks/budgets"
import { hasAccess } from "../../../middleware/budgetsId"

jest.mock('../../../models/Expense', ()=>({
    findByPk: jest.fn()
}))

describe('Expense middlaware - validateExpenseExists',()=>{
    beforeEach(()=>{
        (Expense.findByPk as jest.Mock).mockImplementation((id)=>{
            const expense= expenses.filter(e => e.id === id)[0] ?? null
            return Promise.resolve(expense)
        })
    })
    it('should handle a non-existent budget', async()=>{
    const req= createRequest({
        params:{ExpenseId: 120}
    })
    const res = createResponse()
    const next= jest.fn()

    await validateExpenseExists(req, res, next)

    const data= res._getJSONData()
    expect(res.statusCode).toBe(404)
    expect(data).toEqual({error: 'Gasto no encontrado'})
    expect(next).not.toHaveBeenCalled()
    })

    it('should call next middlaware if expense exists', async()=>{
    const req= createRequest({
        params:{ExpenseId: 1}
    })
    const res = createResponse()
    const next= jest.fn()

    await validateExpenseExists(req, res, next)

    
    expect(next).toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    expect(req.expense).toEqual(expenses[0])
    })

    it('should handle internal server error', async()=>{
    
    (Expense.findByPk as jest.Mock).mockRejectedValue(new Error)

    const req= createRequest({
        params:{ExpenseId: 1}
    })
    const res = createResponse()
    const next= jest.fn()

    await validateExpenseExists(req, res, next)

    const data= res._getJSONData()
    expect(next).not.toHaveBeenCalled()
    expect(data).toEqual({error: 'hubo un error'})
    expect(res.statusCode).toBe(500)
    })

    it('should prevent anauthorized users, form adding expenses',async()=>{
    const req=createRequest({
        method:'POST',
        url:'api/budgets/:budgetId/expenses',
        budget: budgets[0],
        user:{id:20},
        body:{name:'expense test', amount: 30}
    })
    const res=createResponse()
    const next=jest.fn()
    hasAccess(req, res , next)

    const data= res._getJSONData()
    expect(res.statusCode).toBe(401)
    expect(data).toEqual({error: 'accion no valido'})
    expect(next).not.toHaveBeenCalled()
    })
})