import { createRequest, createResponse } from "node-mocks-http"
import Budget from "../../../models/Budget"
import { hasAccess, validateBudgetExists } from "../../../middleware/budgetsId"
import { budgets } from "../../mocks/budgets"

jest.mock('../../../models/Budget',()=>({
    findByPk: jest.fn()
}))

describe('budgetMiddleware - validateBudgetExists', ()=>{
    it('should handle not-existent budget', async()=>{
        (Budget.findByPk as jest.Mock).mockResolvedValue(null)
    
    const req = createRequest({
        params:{
            budgetId: 1
        }
    })
    const res = createResponse()
    const next = jest.fn()

    await validateBudgetExists(req, res, next)
    
    const data = res._getJSONData()
    expect(res.statusCode).toBe(404)
    expect(data).toEqual({error:'Presupuesto no encontrado'})
    expect(next).not.toHaveBeenCalled() //que se detenga la ejecucion.
    })

    it('should proceed to next middleware if budget exists', async()=>{
    (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0])
    
    const req = createRequest({
        params:{
            budgetId: 1
        }
    })
    const res = createResponse()
    const next = jest.fn()

    await validateBudgetExists(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(req.budget).toEqual(budgets[0])
    })

     it('should handle not-existent budget catch', async()=>{
        (Budget.findByPk as jest.Mock).mockRejectedValue(new Error)
    
    const req = createRequest({
        params:{
            budgetId: 1
        }
    })
    const res = createResponse()
    const next = jest.fn()

    await validateBudgetExists(req, res, next)
    
    const data = res._getJSONData()
    expect(res.statusCode).toBe(500)
    expect(data).toEqual({error:'hubo un error'})
    expect(next).not.toHaveBeenCalled() //que se detenga la ejecucion.
    })

})

describe('budgetMiddleware - hasAccess', ()=>{
    it('should call next() if user has access to budget', async()=>{
    const req = createRequest({
        budget: budgets[0],
        user: {id:1}
    })
    const res = createResponse()
    const next = jest.fn()

    hasAccess(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
    })

     it('should return 401 error if userId not have access to budget', async()=>{
    const req = createRequest({
        budget: budgets[0],
        user: {id:2}
    })
    const res = createResponse()
    const next = jest.fn()

    hasAccess(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(401)
    expect(res._getJSONData()).toEqual({error:'accion no valido'})
    })
})