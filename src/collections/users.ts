import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo"
import bcrypt from "bcryptjs"

const coleccionUsers = "users"

export const createUser =  async (email:string, password:string,username:string)=>{
    const db = getDB();
    const noTeLaSabesJAJA = await bcrypt.hash(password,10);


    const result = await db.collection(coleccionUsers).insertOne({
        email,
        password: noTeLaSabesJAJA,
        createdAt: Date.now(),
        username

    });
    return result.insertedId.toString()
}

export const validateUser = async (email:string, password:string) =>{
    const db = getDB();
    const user = await db.collection(coleccionUsers).findOne({email});
    if(!user)return null;
    const comparamosContraseñas = await bcrypt.compare(password,user.password);
    if(!comparamosContraseñas) return null;

    return user;
    
}

export const findUserById = async (id:string) =>{
    const db = getDB();
    return await db.collection(coleccionUsers).findOne({_id:new ObjectId(id)})
}