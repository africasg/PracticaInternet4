import { ApolloServer } from "apollo-server";
import { connectToMongoDb } from "./db/mongo"
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolver";
import { getUserFromToken } from "./auth";

const start = async() =>{
    await connectToMongoDb();

    const server = new ApolloServer({
    typeDefs, //schema
    resolvers, //resolvers
    context:async ({req,res}) => { 
        const authHeader = req.headers.authorization;
        const user = authHeader ? await getUserFromToken(authHeader!) : null;
        return {user};
    }
    });
    await server.listen({port:4000}); 
    console.log("Funciona GraphQL")
};

start().catch((err=>console.error(err)));