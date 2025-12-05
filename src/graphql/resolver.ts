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
    me : async (__,_, {user})=>{
     if(!user)  throw new Error ("No tienes credenciales");
     return {id:user._id.toString(),
            ...user}
    },
    myProjects: async(_,__,{user})=>{
        if(!user) throw new Error ("No tienes credenciales");
        const db = getDB();
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
    },
   Projects: {
    tasks: async (parent: Projects) => {
        const db = getDB();
        return await db.collection<Tasks>(collectionTasks).find({projectId: parent._id?.toString()}).toArray();
    },
    members: async (parent: Projects) => {
    const db = getDB();
    if (!parent.members || parent.members.length === 0) {
        return [];
    }
    const ids = parent.members.map((id) =>
        id instanceof ObjectId ? id : new ObjectId(id)
    );
    return await db.collection<Users>(collectionUsers).find({ _id: { $in: ids } }).toArray();
        },

    },
    Mutation:{
        register: async(_,{email,password,username}: {email:string, password:string,username:string})=>{
            const userId = await createUser(email,password,username)
            const token =  signToken(userId);
            const payload  : AuthPayload={
                token
            }
            return payload;
        },
        login: async(_,{email,password}: {email:string, password:string})=>{
            const user = await validateUser(email,password)
            if(!user) throw new Error ("Esos credenciales no son correctos");
             const token =  signToken(user._id.toString());
              const payload  : AuthPayload={
                token
            }
            return payload;
        },
        createProject: async(__,{name,description,startDate,endDate,members},{user})=>{
             if(!user)  throw new Error ("No tienes credenciales");
             const db = getDB();
           const nuevoProject: Projects = {
            name,
            description,
            startDate,
            endDate,
            owner: new ObjectId(user._id),
            members
        };
            const a =  await db.collection<Projects>(collectionProjects).insertOne(nuevoProject);
            return await db.collection<Projects>(collectionProjects).findOne({_id:a.insertedId})
        },
        updateProject: async (__,{id,name,description,startDate,endDate,members},{user})=>{
            if(!user)  throw new Error ("No tienes credenciales");
             const db = getDB();
             let project = await db.collection<Projects>(collectionProjects).findOne({_id: new ObjectId(id) });
             if(!project) throw new Error ("No existe ese proyecto ");
             if(project.owner.toString() !== user._id.toString()) throw new Error ("No eres el owner");

             if(!description) description = project.description;
            if(!members) members = project.members;
               if(!name) name = project.name;
              if(!startDate) startDate = project.startDate;
              if(!endDate) endDate = project.endDate;
             
            
              await db.collection<Projects>(collectionProjects).updateOne({_id:new ObjectId(id)},{$set:{
                name,startDate,endDate,description,members
              }});
             return await db.collection(collectionProjects).findOne({_id:new ObjectId(id)});
        },
        addMember: async (__,{projectId,userId},{user})=>{
                if (!user) throw new Error ("No tienes credenciales");
                 const db = getDB();
                 const project = await db.collection<Projects>(collectionProjects).findOne({_id: new ObjectId(projectId)})
                 if(!project) throw new Error ("no existe el proyecto");
                 if (project.owner.toString() !== user._id.toString()) throw new Error ("No eres el owner")
                 project.members?.push(new ObjectId(userId));
                await db.collection(collectionProjects).updateOne({_id:projectId},{ $set:{project}})
                return {
                    ...project
                }
        },
        createTask : async(_,{title,projectId,status,priority,dueDate,assignedTo},{user})=>{
            if (!user)  throw new Error ("No tienes credenciales");
            const db = getDB();
            const project = await db.collection<Projects>(collectionProjects).findOne({ _id: new ObjectId(projectId) })
                 if(!project) throw new Error ("no existe el proyecto");
                const esOwner = project.owner.toString() === user._id.toString();
                const esMiembro = project.members?.some( (id) => id.toString() === user._id.toString()
                );
            if (!esOwner && !esMiembro) {throw new Error("No eres el owner ni miembro")}
            
            if (status !== "PENDING" && status !== "IN PROGRESS" && status !== "COMPLETED") {
            status = "PENDING";}

            if (priority !== "LOW" && priority !== "HIGH" && priority !== "MEDIUM") {
                throw new Error("Prio incorrecta");
                    }

            const newTask : Tasks ={
                
                title, 
                projectId,
                status,
                priority,
                dueDate,
                assignedTo

            }
            const a = await db.collection(collectionTasks).insertOne(newTask);
            return await db.collection(collectionTasks).findOne({_id: a.insertedId})
        },
       updateTaskStatus: async (_, { taskId, taskStatus }, { user }) => {
            if (!user) throw new Error("No tienes credenciales");
            const db = getDB();
            const objectId = new ObjectId(taskId);

        const taskChange = await db.collection(collectionTasks).findOne({ _id: objectId });
    if (!taskChange) throw new Error("No existe este task");
    if (taskStatus !== "PENDING" && taskStatus !== "IN PROGRESS" && taskStatus !== "COMPLETED") {
        taskStatus = "PENDING"; }

    await db.collection(collectionTasks).updateOne(
        { _id: objectId },
        { $set: { status: taskStatus } }
    );

    const updatedTask = await db.collection(collectionTasks).findOne({ _id: objectId });

    return {
        ...updatedTask,
        _id: updatedTask?._id.toString()
    };
},

        deleteProject: async(_, {id}, {user}) =>{
            if(!user) throw new Error("No tienes credenciales correctas");
            const db = getDB();
            let proyecto = await db.collection<Projects>(collectionProjects).findOne({_id: new ObjectId(id)});
            if(!proyecto) throw new Error("No existe el proyecto")
            if(proyecto.owner.toString() !== user._id.toString()) throw new Error("No eres el owner del proyecto")

            await db.collection(collectionProjects).deleteOne({_id: new ObjectId(id)});
            await db.collection(collectionTasks).deleteMany({projectId: new ObjectId(id)});
            return proyecto;
        }
    }
}