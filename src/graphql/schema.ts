import { gql } from "apollo-server"

export const typeDefs = gql`
     
    type User{
        id: ID!,
        username:String! 
        email:String!,
        password: String!,
        createdAt: String
    },
    type Projects{
        _id: ID!,
        name: String!,
        description: String!,
        startDate: String!,
        endDate: String!, 
        owner: ID,
        members: [User!],
        tasks: [Tasks]
    },
    type AuthPayload{
        token: String!
    }
    type Tasks{
         _id: ID!,
        title: String!
        projectId: ID!, 
        assignedTo: ID, 
        status: String,
        priority: String,
        dueDate: String,
        
    }

     type Query {
        me:User
        myProjects:[Projects!],
        projectDetails (projectId: ID!): Project
        users: [User!]!
    }

    type Mutation {
        register(email: String!, password: String!): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
        createProject(name: String!, startDate: String!, endDate: String! , members: [User]): Project!
        updateProject(id:ID!, name: String, description:String ,startDate: String, endDate: String, members:[User]): Project
        addMember(projectId:ID!, userID:ID!): Project
        createTask(projectId:ID!,title:String!,status:String, priority:String!, dueDate: String!): Tasks!
        updateTaskStatus(taskId: ID!, taskStatus: String!) : Tasks
        deleteProject(id:ID!): Project
    }
    `
