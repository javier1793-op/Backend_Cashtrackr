import {createResponse , createRequest} from 'node-mocks-http'
import { budgets } from "../mocks/budgets";
import { BudgetController } from '../../controllers/BudgetController';
import Budget from '../../models/Budget';


jest.mock('../../models/Budget', ()=>({
    findAll: jest.fn()
}))


describe('BudgetController.getAll',()=>{

    beforeEach(()=>{
        (Budget.findAll as jest.Mock).mockReset();
        (Budget.findAll as jest.Mock).mockImplementation((options)=>{
            const updateBudgets = budgets.filter(budget=> budget.userId === options.where.userId);
            return Promise.resolve(updateBudgets)
        })
    })

    it('should retrieve 2 budgets with Id 1 user',  async()=>{
       
        const req= createRequest({
            method:'GET',
            url:'/api/budgets',
            user:{id:1}
        }) 
        const res= createResponse();


        await BudgetController.getAll(req, res)
        const data = res._getData();
        expect(data).toHaveLength(2)
        expect(res.statusCode).toBe(200);
        expect(res.status).not.toBe(404)
    })
})

describe('BudgetController.getAll',()=>{
    it('should retrieve 1 budgets with Id 2 user',  async()=>{
       
        const req= createRequest({
            method:'GET',
            url:'/api/budgets',
            user:{id:2}
        }) 
        const res= createResponse();

        await BudgetController.getAll(req, res)
        const data = res._getData();
        expect(data).toHaveLength(1)
        expect(res.statusCode).toBe(200);
        expect(res.status).not.toBe(404)
    })
})

describe('BudgetController.getAll',()=>{
    it('should retrieve 0 budgets with Id 10 user',  async()=>{
       
        const req= createRequest({
            method:'GET',
            url:'/api/budgets',
            user:{id:10}
        }) 
        const res= createResponse();

      
        await BudgetController.getAll(req, res)
        const data = res._getData();
        expect(data).toHaveLength(0)
        expect(res.statusCode).toBe(200);
        expect(res.status).not.toBe(404)
    })
})

describe('BudgetController.getAll',()=>{
    it('should handle errors when fetching budgets',  async()=>{
       
        const req= createRequest({
            method:'GET',
            url:'/api/budgets',
            user:{id:100}
        }) 
        const res= createResponse();

        (Budget.findAll as jest.Mock).mockRejectedValue(new Error)
        await BudgetController.getAll(req, res)

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({error: 'hubo un error'})
    })
})