import { IResolvers } from "@graphql-tools/utils"
import { getDB } from "../db/mongo"
import { ObjectId } from "mongodb";
import { createUser,validateUser } from "../collections/users";
import { signToken } from "../auth";
import {Users} from "../types/users";
import {AuthPayload} from "../types/AuthPayload";
import { Projects } from "../types/projects";
import { Tasks } from "../types/tasks";
const collectionProjects = "projects"
const collectionTasks = "tasks";
const collectionUsers = "users";

export const resolvers: IResolvers = {
    Query: {
    me : async (__,_, {user})=>{//en el parentesis se pone (gql,argumentos,contexto); en la parte donde pone user, se puede poner ctx.user
     if(!user)  throw new Error ("No tienes credenciales");
     return {id:user._id.toString(),
            ...user}
    },
    myProjects: async(_,__,{user})=>{
        if(!user) throw new Error ("No tienes credenciales");
        return await db.collection(collectionProjects).find().toArray();
    },
    projectDetails : async(_,{projectId}:{projectId:string},{user})=>{
        if(!user) throw new Error ("No tienes credenciales");;
        const db = getDB();
        return await db.collection(collectionProjects).findOne({_id:new ObjectId(projectId)})
    },
    users: async(_,__,{user})=>{
        if(!user)  throw new Error ("No tienes credenciales");;
        const db = getDB();
        return await db.collection(collectionUsers).find().toArray();
    },
    Project:{
        tasks:(parent:Projects)=>{
            /// Buscar en la coleccion de Task que tareas tienen como projectId el valor de parent._id
        }
    }
    },
    Mutation:{
        register: async(_,{email,password}: {email:string, password:string})=>{
            const userId = await createUser(email,password)
            const token =  signToken(userId);
            const payload  : AuthPayload={
                token
            }
            return payload;
        },
        login: async(_,{email,password}: {email:string, password:string})=>{
            const user = await validateUser(email,password)
            if(!user) throw new Error ("Esos credenciales no son correctos mi vida");
             const token =  signToken(user._id.toString());
              const payload  : AuthPayload={
                token
            }
            return payload;
        },
        createProject: async(__,{name,description,startDate,endDate,members},{user})=>{
             if(!user)  throw new Error ("No tienes credenciales");
             const db = getDB();
             const nuevoProject : Projects ={
                name, 
                description,
                startDate,
                endDate,
                members,
                owner : user._id
             }
            return await db.collection<Projects>(collectionProjects).insertOne(nuevoProject);
        },
        updateProject: async (__,{id,name,description,startDate,endDate,members},{user})=>{
            if(!user)  throw new Error ("No tienes credenciales");
             const db = getDB();
             let project = await db.collection<Projects>(collectionProjects).findOne({_id:id});
             if(!project) throw new Error ("No existe ese proyecto ");
             if(project.owner !== user._id) throw new Error ("No eres el owner");
            const updates : any = {}
            if (description) updates.description=description;
            if(members) updates.members=members;
            updates.name=name;
            updates.startDate=startDate;
            updates.endDate = endDate;
             return await db.collection(collectionProjects).updateOne({_id:id},{$set: {updates}});
        },
        addMember: async (__,{projectId,userId},{user})=>{
                if (!user)  throw new Error ("No tienes credenciales");
                 const db = getDB();
                 const project = await db.collection<Projects>(collectionProjects).findOne({_id:projectId})
                 if(!project) throw new Error ("no existe el proyecto");
                 if (project.owner !== user._id) throw new Error ("No eres el owner")
                 project.members?.push(new ObjectId(userId));
                await db.collection(collectionProjects).updateOne({_id:projectId},{ $set:{project}})
                return {
                    ...project
                }
        },
        createTask : async(_,{title,projectId,status,priority,dueDate,assignedTo},{user})=>{
            if (!user)  throw new Error ("No tienes credenciales");
            const db = getDB();
            const project = await db.collection<Projects>(collectionProjects).findOne({_id:projectId})
                 if(!project) throw new Error ("no existe el proyecto");
                const esMiembro = project.members?.some((n)=>user._id===n);
              if ((project.owner !== user._id) && (!esMiembro){
                throw new Error ("No eres el owner ni miembro ")
              }
            if(status !== "PENDING "||status !== "IN PROGRESS "||status !== "COMPLETED"){
                status="PENDING"
            }
            if(priority!== "LOW"||priority!== "HIGH"||priority!== "MEDIUM"){
                throw new Error ("Prio incorrecta")
            }
            const newTask : Tasks ={
                
                title, 
                projectId,
                status,
                priority,
                dueDate,
                assignedTo

            }
            await db.collection(collectionTasks).insertOne(newTask);
        },
        updateTaskStatus : async (__, {taskId, taskStatus},{user})=>{
            if (!user)  throw new Error ("No tienes credenciales");
            const db = getDB();
            const taskChange = await db.collection(collectionTasks).findOne({_id:taskId})
            if(!taskChange) throw new Error ("No existe este task");
            if(taskStatus !== "PENDING "||taskStatus !== "IN PROGRESS "||taskStatus !== "COMPLETED"){
                taskStatus="PENDING"
            }
            return await db.collection(collectionTasks).updateOne({_id:taskId},{$set: {status:taskStatus}})
        }
    }
