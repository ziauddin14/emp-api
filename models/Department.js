import mongoose from "mongoose";
import Employee from './Employee.js'
import Leave from './Leave.js'
import Salary from './Salary.js'
const departmentSchema = new mongoose.Schema({
    dep_name: {
        type: String,
        require : true
    },
    description:{
        type:String,
    },
    createdAt: {
        type:Date,
        default:Date.now
    },
    updatedAt: {
        type:Date,
        default:Date.now
    }
}) 
departmentSchema.pre("deleteOne", {document: true, query: false}, async function(next){
    try{
        const employes = await Employee.find({department: this._id})
        const empId = employes.map(emp => emp._id)

        await Employee.deleteMany({department: this._id})
        await Leave.deleteMany({employeeId: {$in : empId}})
        await Salary.deleteMany({employeeId: {$in : empId}})
        next()
    }catch(error) {
        next(error)
    }
})
const Department = mongoose.model("Department", departmentSchema)
export default Department;