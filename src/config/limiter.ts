import { rateLimit } from 'express-rate-limit'

export const limitier=rateLimit({
    windowMs: 60 * 1000, //1 minuto
    limit: 5, //cantidad de peticiones
    message:{"error": "Has alcanzado el limite de peticiones."}
})