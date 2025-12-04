import { ObjectId } from "mongodb"

export type Projects ={
_id?: ObjectId,
name: string,
description: string,
startDate: Date,
endDate: Date, //requerido (debe ser posterior a startDate).
owner: ObjectId,
members: Array<ObjectId>,
tasks: Array<String>
}
