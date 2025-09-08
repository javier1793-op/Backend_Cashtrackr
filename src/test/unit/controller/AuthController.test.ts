import {createResponse , createRequest} from 'node-mocks-http'
import { AuthController } from '../../../controllers/AuthController'
import User from '../../../models/User'
import { checkPassword, hastPassword } from '../../../Utils/auth'
import { generateToken } from '../../../Utils/token'
import { AuthEmail } from '../../../emails/AuthEmail'
import { JWT } from '../../../Utils/jwt'

jest.mock('../../../models/User')
jest.mock('../../../Utils/auth')
jest.mock('../../../Utils/token')
jest.mock('../../../Utils/jwt')

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

describe('AuthController.login', ()=>{
    it('should return 404 if user is not found', async ()=>{
        
        (User.findOne as jest.Mock).mockResolvedValue(null)

        const req= createRequest({
            method:'POST',
            url:'/api/auth/login',
            body:{
                email:'test@test.com',
                password:'tester123'
            }
        })
        const res= createResponse();

        await AuthController.login(req,res)
        const data= res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toEqual({error:'El usuario no esta registrado'})
    })

     it('should return 403 if the account has not been confirmed', async ()=>{
        
        (User.findOne as jest.Mock).mockResolvedValue({
            id:1,
            email:'test@test.com',
            password:'passwordtest',
            confirm:false
        })

        const req= createRequest({
            method:'POST',
            url:'/api/auth/login',
            body:{
                email:'test@test.com',
                password:'tester123'
            }
        })
        const res= createResponse();

        await AuthController.login(req,res)
        const data= res._getJSONData()

        expect(res.statusCode).toBe(403)
        expect(data).toEqual({error:'El registro no esta confirmado'})
    })

     it('should return 401 if the password is incorrect', async ()=>{
        
        const mockUser={
            id:1,
            email:'test@test.com',
            password:'passwordtest',
            confirm:true
        };
        (User.findOne as jest.Mock).mockResolvedValue(mockUser)

        const req= createRequest({
            method:'POST',
            url:'/api/auth/login',
            body:{
                email:'test@test.com',
                password:'tester123'
            }
        })
        const res= createResponse();

        (checkPassword as jest.Mock).mockResolvedValue(false);
        await AuthController.login(req,res);
        const data= res._getJSONData()

        expect(res.statusCode).toBe(401)
        expect(data).toEqual({error:'la contraseña ingresada es incorrecta'})
        expect(checkPassword).toHaveBeenCalledWith(req.body.password,mockUser.password)
        expect(checkPassword).toHaveBeenCalled()
    })

    it('should return a JWT if authentication is successful', async ()=>{
        
        const mockUser={
            id:1,
            email:'test@test.com',
            password:'passwordtest',
            confirm:true
        };
        (User.findOne as jest.Mock).mockResolvedValue(mockUser)

        const req= createRequest({
            method:'POST',
            url:'/api/auth/login',
            body:{
                email:'test@test.com',
                password:'tester123'
            }
        })
        const res= createResponse();

        const fakejwt='tokengenerado';

        (checkPassword as jest.Mock).mockResolvedValue(true);
        (JWT as jest.Mock).mockReturnValue(fakejwt);
        await AuthController.login(req,res);
        const data= res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual(fakejwt)
        expect(JWT).toHaveBeenCalledTimes(1)
        expect(JWT).toHaveBeenCalledWith(mockUser.id)
      
    })
})