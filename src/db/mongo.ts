import {Db, MongoClient} from "mongodb";
import dotenv from "dotenv";

dotenv.config(); 

let client : MongoClient
let db : Db

export const connectToMongoDb = async (): Promise<void>=>{
    try{
        const urlMongo = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.CLUSTER}.rinwayw.mongodb.net/?appName=${process.env.CLUSTER_NAME}`;
        client = new MongoClient(urlMongo);
        await client.connect(); // si da cualquier error irña al catch directamente
        db = client.db("Practica4")
            console.log("Conectado a Mongo my g");


    } catch(error){
        console.error("Error al conectar a Mongo");
        process.exit(1); 
    }
  
} 
export const getDB=(): Db => db; 