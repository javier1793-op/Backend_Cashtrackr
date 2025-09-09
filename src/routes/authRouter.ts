import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validator";
import { limitier } from "../config/limiter";
import { authenticate } from "../middleware/auth";

const router= Router()

router.use(limitier)

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('El campo nombre no puede ir vacio'),
    body('password')
        .isLength({min:8}).withMessage('Es password es muy corto, mínimo 8 caracteres'),
    body('email')
        .isEmail().withMessage('El email no es valido'),
    handleInputErrors,
    AuthController.createAccount)

router.post('/confirm-account',
    body('token')
        .isLength({min:6, max:6})
        .withMessage('token no valido'),
    handleInputErrors,
    AuthController.confirmAccount)

router.post('/login',
    body('email')
        .isEmail().withMessage('correo no valido'),
    body('password')
        .notEmpty().withMessage('la contraseña no puede ir vacia'),
    handleInputErrors,
    AuthController.login
    )

router.post('/forgot-password',
    body('email')
        .isEmail().withMessage('correo no valido'),
    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
     body('token')
        .notEmpty()
        .isLength({min:6, max:6})
        .withMessage('token no valido'),
    handleInputErrors,
    AuthController.validateToken
)

router.post('/resetPassword/:token',
    param('token')
        .notEmpty()
        .isLength({min:6, max:6})
        .withMessage('token no valido'),
    body('password')
        .notEmpty().withMessage('la contraseña no puede ir vacia'),
    handleInputErrors,
    AuthController.resetPasswordToken
)

router.get('/user',
    authenticate,
    AuthController.user
)

router.post('/update-password',
    authenticate,
    body('current_password')
        .notEmpty().withMessage('la contraseña no puede ir vacia'),
     body('password')
        .isLength({min:8}).withMessage('Es password es muy corto, mínimo 8 caracteres'),
    handleInputErrors,
    AuthController.current_password
)

router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('la contraseña no puede ir vacia'),
    handleInputErrors,
    AuthController.checkPassword
)

export default router