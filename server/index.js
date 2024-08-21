const express = require("express");
var cors = require('cors')
const dotenv = require("dotenv");
const app = express();
const { default: mongoose } = require("mongoose");
const userRoutes = require("./Routes/userRoutes");
const bidRoutes = require("./Routes/bidRoutes");
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.use(
    cors({
        origin: "*",
    })
);
dotenv.config();

app.use(express.json());




const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected with server');
    } catch (err) {
        console.log('error! MongoDB not  Connected with server', err.message);
    }
};

connectDB();


app.get("/", (req, res) => {
    res.send("API is running well");
});

//routes
app.use("/user", userRoutes);
app.use("/bid", bidRoutes);

// error handling middleware
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5008
const server = app.listen(PORT, console.log("Server is Running... fast"));

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
    pingTimeout: 60000,
});

io.on("connection", (socket) => {
    console.log("New client connected");


    // Handle bid updates
    socket.on('update', ({ bidId }) => {
        console.log("Bid ID:", bidId);
        io.emit('bidUpdate', bidId);
    });

    socket.on('submit', ({  })=>{
        console.log('submit');
        io.emit('submitted',{})
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
    // Handle bid updates



});



//app.listen(PORT, console.log("Server is running.........."));
