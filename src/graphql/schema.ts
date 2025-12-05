import { gql } from "apollo-server"

export const typeDefs = gql`
     
    type User{
        _id: ID!,
        username:String! ,
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
        members: [User!]!,
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
        projectDetails (projectId: ID!): Projects
        users: [User!]!
    }

    type Mutation {
        register(email: String!, password: String!,username:String!): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
        createProject(name: String!, description:String, startDate: String!, endDate: String! , members: [ID]): Projects!
        updateProject(id:ID!, name: String, description:String ,startDate: String, endDate: String, members:[ID]): Projects
        addMember(projectId:ID!, userID:ID!): Projects
        createTask(projectId:ID!,title:String!,status:String, priority:String!, dueDate: String!): Tasks!
        updateTaskStatus(taskId: ID!, taskStatus: String!) : Tasks
        deleteProject(id:ID!): Projects
    }
    `
