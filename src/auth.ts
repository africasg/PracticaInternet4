import jwt from "jsonwebtoken";
import { getDB } from "./db/mongo";
import { ObjectId } from "mongodb";

export type TokenPayload = { //lo que metamos aqui dentro que sea lo mínimo posible
    userId : string;
}

const SUPER_SECRET = process.env.SUPER_SECRET;

export const signToken = (userId: string) =>{
       return jwt.sign({userId}, SUPER_SECRET!,{ expiresIn: "1h"})
} 
//con bcrypt no puedo obtener el dato original
//jwt se puede desencriptar (tiene una cable común), en el token lo utilizaremos
export const verifyToken = (token:string) :TokenPayload | null =>{
    try{
            return jwt.verify(token,SUPER_SECRET!) as TokenPayload
    }catch{
        return null;
    }
};

export const getUserFromToken = async (token:string)=>{
    const payload = verifyToken(token); 
    if(!payload) return null;

    const db = getDB();
    return await db.collection("users").findOne({_id:new ObjectId(payload.userId)})

}