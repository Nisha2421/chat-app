import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import { connectDB, disconnectDB } from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import { messageRouter } from './routes/messageRoutes.js'
import { Server } from "socket.io";

// create Express and http server

const app = express() 
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server, {
    cors : {origin: "*"}
})

// store online users
export const userSocketap = {} // { userId: socketId }

// socket.io connected handler

io.on("connection",(socket) => {
const userId = socket.handshake.query.userId;
console.log("user connected", userId);
if(userId){
    userSocketap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketap))
    socket.on("disconnect",() => {
        console.log("User Disconnected", userId);
        delete userSocketap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketap))
    })
}

})


//middileware setup
app.use(express.json({limit:"4mb"}))
app.use(cors())

// Catch-all for undefined routes
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: "Route not found" });
// });

// Routes set-up
app.use("/api/status",(req, res) => res.send("Server is live"))
app.use('/api/auth',userRouter)
app.use("/api/messages", messageRouter)

const PORT = process.env.port || 8000;
connectDB()



// disconnectDB()
server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    
})