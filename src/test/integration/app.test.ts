import request from "supertest";
import server, { connectDB } from "../../server";
import { AuthController } from "../../controllers/AuthController";
import User from "../../models/User";
import * as authUtils from "../../Utils/auth";
import * as jwtUtils from "../../Utils/jwt";

describe("Authentication - Create account", () => {
  it("should display validation errors when form is empty", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({});
    const createMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(3);
    expect(response.status).not.toBe(201);
    expect(response.body.errors).not.toHaveLength(2);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("should return 400 when the email is invalid", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({
        name: "javier",
        password: "12345678",
        email: "no_valido",
      });
    const createMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.status).not.toBe(201);
    expect(response.body.errors).not.toHaveLength(2);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("should return 400 status code when the password is less than 8 character", async () => {
    const response = await request(server)
      .post("/api/auth/create-account")
      .send({
        name: "javier",
        password: "short",
        email: "javier@test.com",
      });
    const createMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe(
      "Es password es muy corto, mínimo 8 caracteres"
    );
    expect(response.status).not.toBe(201);
    expect(response.body.errors).not.toHaveLength(2);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("should return 201 when user registred", async () => {
    const dataUser = {
      name: "javier",
      password: "password",
      email: "javier@test.com",
    };
    const response = await request(server)
      .post("/api/auth/create-account")
      .send(dataUser);

    expect(response.status).toBe(201);
    expect(response.body).not.toHaveProperty("errors");
    expect(response.status).not.toBe(400);
  });

   it("should register a new user successfully", async () => {
    const dataUser = {
      name: "javier",
      password: "password",
      email: "javier@test.com",
    };
    const response = await request(server)
      .post("/api/auth/create-account")
      .send(dataUser);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('El email ya se encuentra registrado')
    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(201);
    expect(response.body).not.toHaveProperty("errors");
  });
});

describe("Authentication - Account confirmation with token", ()=>{
  it('should display error if token is empty or token is not valid', async()=>{
    const response= await request(server)
                        .post('/api/auth/confirm-account')
                        .send({
                          token:'no_valide'
                        })
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('errors')
    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].msg).toBe('token no valido')
  })

  it('should display error if token is no valid', async()=>{
    const response= await request(server)
                        .post('/api/auth/confirm-account')
                        .send({
                          token:'123456'
                        })
    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('Token no valido')
    expect(response.status).not.toBe(200)
  })

  it('should confirm account', async()=>{

    const token= globalThis.chashtrackrConfirmToken
    const response= await request(server)
                        .post('/api/auth/confirm-account')
                        .send({token })

    expect(response.status).toBe(200)
    expect(response.body).toBe('Cuenta confirmada correctamente')
    expect(response.status).not.toBe(401)
  })
})

describe("Authentication - login", ()=>{
  
    beforeEach(()=>{
        jest.resetAllMocks()
    })
  it('should display validation errors when the form is empty', async()=>{
    const response= await request(server)
                .post('/api/auth/login')
                .send({});
    
    const loginMock= jest.spyOn(AuthController, 'login');

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('errors')
    expect(response.body.errors).toHaveLength(2)
    expect(response.body.errors).not.toHaveLength(1)
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('should return  a 400 error if the user is not found', async()=>{
    const response= await request(server)
                .post('/api/auth/login')
                .send({
                  "email":"anonimo@test.com",
                  "password":"password"
                });
    

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('El usuario no esta registrado')
    expect(response.status).not.toBe(200)
  })

   it('should return 403 error if the user account is not confirmed', async()=>{
   
    (jest.spyOn(User, 'findOne')as jest.Mock)
      .mockResolvedValue({
        id:1,
        confirm:false,
        password:'noConfirm',
        email:'test22@test.com'
      })
    const response= await request(server)
                .post('/api/auth/login')
                .send({
                  "email":"test22@test.com",
                  "password":"password"
                });
    

    expect(response.status).toBe(403)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('El registro no esta confirmado')
    expect(response.status).not.toBe(200)
  })

  it('should return 401  error if the password is incorrect', async()=>{
   
   const findOne= (jest.spyOn(User, 'findOne')as jest.Mock)
      .mockResolvedValue({
        id:1,
        confirm:true,
        password:'noConfirm',
        email:'test22@test.com'
      })

    const checkPassword=jest.spyOn(authUtils, 'checkPassword').mockResolvedValue(false)
    const response= await request(server)
                .post('/api/auth/login')
                .send({
                  "email":"test22@test.com",
                  "password":"password"
                });
    

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBe('la contraseña ingresada es incorrecta')
    expect(response.status).not.toBe(200)
    expect(response.status).not.toBe(400)
    expect(findOne).toHaveBeenCalledTimes(1)
    expect(checkPassword).toHaveBeenCalledTimes(1)
  })

   it('should return 200 user correct', async()=>{
   
   const findOne= (jest.spyOn(User, 'findOne')as jest.Mock)
      .mockResolvedValue({
        id:1,
        confirm:true,
        password:'Confirm',
        email:'test22@test.com'
      })

    const checkPassword=jest.spyOn(authUtils, 'checkPassword').mockResolvedValue(true)
    const generateJWT = jest.spyOn(jwtUtils, 'JWT').mockReturnValue('token_jwt')
    const response= await request(server)
                .post('/api/auth/login')
                .send({
                  "email":"test22@test.com",
                  "password":"password"
                });
    

    expect(response.status).toBe(200)
    expect(response.body).toEqual('token_jwt')
    expect(response.status).not.toBe(400)
    expect(findOne).toHaveBeenCalledTimes(1)
    expect(generateJWT).toHaveBeenCalledTimes(1)
    expect(checkPassword).toHaveBeenCalledTimes(1)
    expect(checkPassword).toHaveBeenCalledWith('password','Confirm')
  })
})

describe("GET /api/budgets",()=>{

  let jwt:string
  beforeAll(()=>{
    jest.restoreAllMocks()
  })

  beforeAll(async()=>{
    const response=await request(server)
              .post('/api/auth/login')
              .send({
                email:'javier@test.com',
                password:'password'
              })
    jwt= response.body
  })

  it('should reject unauthenticated access to budgets without a jwt', async()=>{
    const response= await request(server)
                  .get('/api/budgets')

    expect(response.status).toBe(401)
    expect(response.body.error).toBe('No autorizado')
  })

  it('should reject unauthenticated access to budgets without a valid jwt', async()=>{
    const response= await request(server)
                  .get('/api/budgets')
                  .auth('no_token',{type:'bearer'})

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Token no valido')
  })

   it('should allow authenticated access to budgets with a valid jwt', async()=>{
    const response= await request(server)
                  .get('/api/budgets')
                  .auth(jwt,{type:'bearer'})

    expect(response.body).toHaveLength(0)
    expect(response.status).not.toBe(401)
    expect(response.body.error).not.toBe('No autorizado')
  })
})