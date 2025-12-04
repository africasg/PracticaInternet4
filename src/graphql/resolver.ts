import { IResolvers } from "@graphql-tools/utils"
import { getDB } from "../db/mongo"
import { ObjectId } from "mongodb";
import { createUser,validateUser } from "../collections/users";
import { signToken } from "../auth";

const collectionProjects = "projects"
const collectionTasks = "tasks";
const collectionUsers = "users";

export const resolvers: IResolvers = {
    Query: {
        me : async (__,_, {user})=>{//en el parentesis se pone (gql,argumentos,contexto); en la parte donde pone user, se puede poner ctx.user
     if(!user) return null;
     return {id:user._id.toString(),
            ...user}
    }

    },
    Mutation:{

    }
}
