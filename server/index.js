const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const userRoutes = require("./routes/userRoutes")
const messageRoutes = require("./routes/messagesRoute")
const socket = require("socket.io")

const app = express();
require("dotenv").config(); 

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes)
app.use("/api/messages", messageRoutes)

mongoose.connect(process.env.MONGO_URL, {
}).then(()=>{
    console.log("DB Connection Successful");
}).catch((err)=>{
    console.log(err.message);
});

const server = app.listen(process.env.PORT, ()=> {
    console.log(`Server is running on Port ${process.env.PORT}`);
});

const io = socket(server,{
    cors:{
        origin: "http://localhost:3000",
        credentials: true,
    }
})

onlineUsers = new Map();

io.on("connection",(socket)=>{
    socket.on("add-user",(userId)=>{
        onlineUsers.set(userId, socket.id)
    });
    socket.on("send-msg", (data)=>{
        const sendUserSocket = onlineUsers.get(data.to);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("msg-recieved", data.message)
        }
    });
})
