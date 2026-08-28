const pgp=require('pg-promise')
const db = pgp('postgres://username:password@host:port/database');

const express=require("express");
const app=express();
app.use(express.json())
app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})