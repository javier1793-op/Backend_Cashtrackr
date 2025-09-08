import type { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hastPassword } from "../Utils/auth";
import { generateToken } from "../Utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { JWT } from "../Utils/jwt";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existEmail = await User.findOne({ where: { email } });
    if (existEmail) {
      const error = new Error("El email ya se encuentra registrado");
      return res.status(409).json({ error: error.message });
    }

    try {
      const user = await  User.create(req.body);
      user.password = await hastPassword(password);
      user.token = generateToken();
      await user.save();

      AuthEmail.sendConfirmationEmail({
        name: user.name,
        email: user.email,
        token: user.token,
      });

      res.status(401).json("Cuenta creada correctamente");
    } catch (error) {
      //console.log(error)
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    const { token } = req.body;
    const user = await User.findOne({ where: { token } });
    if (!user) {
      const error = new Error("Token no valido");
      return res.status(401).json({ error: error.message });
    }

    user.confirm = true;
    user.token = null;
    await user.save();
    res.json("Cuenta confirmada correctamente");
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("El usuario no esta registrado");
      return res.status(404).json({ error: error.message });
    }

    if (!user.confirm) {
      const error = new Error("El registro no esta confirmado");
      return res.status(403).json({ error: error.message });
    }

    const isPasswordCorrect = await checkPassword(password, user.password);
    if (!isPasswordCorrect) {
      const error = new Error("la contraseña ingresada es incorrecta");
      return res.status(401).json({ error: error.message });
    }

    const token = JWT(user.id);
    res.json(token);
  };

  static forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("El usuario no esta registrado");
      return res.status(404).json({ error: error.message });
    }

    user.token = generateToken();
    await user.save();

    AuthEmail.resetPasswordToken({
      name: user.name,
      email: user.email,
      token: user.token,
    });

    res.json("Revisa tu email");
  };

  static validateToken = async (req: Request, res: Response) => {
    const { token } = req.body;

    const tokenExists = await User.findOne({ where: { token } });
    if (!tokenExists) {
      const error = new Error("token no valido");
      return res.status(404).json({ error: error });
    }

    res.json("Token valido");
  };

  static resetPasswordToken = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ where: { token } });
    if (!user) {
      const error = new Error("Token no valido");
      return res.status(401).json({ error: error.message });
    }

    user.password = await hastPassword(password);
    user.token = null;
    await user.save();
    res.json("La constraseña fue modificada correctamente");
  };

  static user = async (req: Request, res: Response) => {
     res.json(req.user)
  }

  static current_password = async (req: Request, res: Response) => {
      const {current_password , password} = req.body
      const {id}= req.user

      const user= await User.findByPk(id)
      const passwordCorrect= await checkPassword(current_password, user.password)
      if(!passwordCorrect){
        const error= new Error('El password actual no coincide')
        return res.status(401).json({error: error.message})
      } 

      user.password = await hastPassword(password)
      await user.save()

      res.json('El password fue modificado correctamente')
  }

  static checkPassword = async (req: Request, res: Response) => {
     const {password} = req.body
      const {id}= req.user

      const user= await User.findByPk(id)
      const passwordCorrect= await checkPassword(password, user.password)
      if(!passwordCorrect){
        const error= new Error('El password actual no coincide')
        return res.status(401).json({error: error.message})
      } 

      res.json('El password es correctamente')
  }
}

