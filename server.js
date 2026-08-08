import express from "express";
const app =express();

const port =  3000;



app.use("/",);

app.listen(port,(err)=>{
    if(err){
        console.log("error in starting the server ", port);
    }
  
    console.log("Server Started successfully on port", port);
})