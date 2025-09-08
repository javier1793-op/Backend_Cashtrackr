import {createResponse , createRequest} from 'node-mocks-http'
import { AuthController } from '../../../controllers/AuthController'
import User from '../../../models/User'
import { hastPassword } from '../../../Utils/auth'
import { generateToken } from '../../../Utils/token'
import { AuthEmail } from '../../../emails/AuthEmail'

jest.mock('../../../models/User')
jest.mock('../../../Utils/auth')
jest.mock('../../../Utils/token')

describe('AuthController.createAccount', ()=>{

    beforeEach(()=>{
        jest.resetAllMocks()
    })

    it('should return a 409 status and an error message if the email is already registerd', async ()=>{
        
        (User.findOne as jest.Mock).mockResolvedValue(true)

        const req= createRequest({
            method:'POST',
            url:'/api/auth/create-account',
            body:{
                email:'test@test.com',
                password:'tester123'
            }
        })
        const res= createResponse();

        await AuthController.createAccount(req,res)
        const data= res._getJSONData()

        expect(res.statusCode).toBe(409)
        expect(data).toHaveProperty('error','El email ya se encuentra registrado')
        expect(User.findOne).toHaveBeenCalled()
        expect(User.findOne).toHaveBeenCalledTimes(1)
    })

    it('Should register a new user and return a success message', async ()=>{
        
        const req= createRequest({
            method:'POST',
            url:'/api/auth/create-account',
            body:{
                name:'test',
                email:'test@test.com',
                password:'tester123'
            }
        })
        const res= createResponse();
        const mockUser={...req.body, save: jest.fn()};

        (User.create as jest.Mock).mockResolvedValue(mockUser);
        (hastPassword as jest.Mock).mockResolvedValue('passwordhast');
        (generateToken as jest.Mock).mockReturnValue('123456');
        jest.spyOn(AuthEmail,'sendConfirmationEmail').mockImplementation(()=>Promise.resolve())

        await AuthController.createAccount(req,res);

        expect(User.create).toHaveBeenCalledWith(req.body)
        expect(User.create).toHaveBeenCalledTimes(1)
        expect(mockUser.save).toHaveBeenCalled()
        expect(mockUser.password).toBe('passwordhast')
        expect(mockUser.token).toBe('123456')
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
            name:req.body.name,
            email:req.body.email,
            token:'123456'
        })
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1)
        expect(res.statusCode).toBe(401)
        
    })
})
