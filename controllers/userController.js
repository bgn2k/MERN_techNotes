const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean()
    if(!users?.length){
        return res.status(400).json({message : 'No Users Found In MongoDB'})
    }
    res.json(users)
});
// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const {username, password, roles} = req.body
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).res.json({message : "All Fields Are Required."})
    }
    const duplicate = await User.findOne({username}).lean().exec()
    if(duplicate){
        return res.status(409).json({message : 'Duplicate User: User already exists in MongoDB'})
    }
    //Hashing Password
    const hashedPswd = await bcrypt.hash(password, 10)
    const userObject = {
        username, 
        "password" : hashedPswd,
        roles
    }
    const user =await User.create(userObject)
    if(user){
        res.status(201).json({message : 'New User Successfully Saved In MongoDB'})
    }else{
        res.status(400).json({message : 'Invalid User Data'})
    }
});
// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const {id, username, roles, active, password} = req.body
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
        return res.status(400).json({message : "All Fields Are Required."}) 
    }
    const user = await User.findById(id).exec()
    if(!user){
        return res.status(400).json({message : 'User Does Not Exist in MongoDB'})
    }
    const duplicate = await User.findOne({username}).lean().exec()
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message : 'Duplicate Username'})
    }
    user.username = username,
    user.roles = roles,
    user.active = active
    if(password){
        user.password = await bcrypt.hash(password, 10)//salt rounds  
    }
    const updatedUser = await user.save()
    res.json({message : `Updated ${updatedUser.username} successfully In MongoDB`})
});
// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    console.log(req.body)
    const {id} = req.body
    if(!id){
        return res.status(400).json({message : 'Id is required'})
    }
    const note = await Note.findOne({user:id}).lean().exec()
    if(note){
        return res.status(400).json({message : 'User has assigned notes'})
    }
    const user = await User.findById(id).exec()
    if(!user){
        return res.status(400).json({message : 'User Does Not Exists In MongoDB'})
    }
    console.log('Print this')
    const result = await user.deleteOne(id)
    console.log('RESULT : ', result)
    const reply = `Username ${result.username} with ID ${result._id} deleted`
    res.json(reply)
});
module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser
};
