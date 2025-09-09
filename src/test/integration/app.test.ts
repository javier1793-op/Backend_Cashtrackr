import request from "supertest";
import server, { connectDB } from "../../server";
import { AuthController } from "../../controllers/AuthController";

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