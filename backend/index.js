// const express = require("express");
// const app = express();
// const server = require("http").createServer(app);
// const io = require("socket.io")(server);


// const port = 3000;

// io.on("connection", socket => {
//     console.log("A user is connected");

//     //to listen for the chat message
//     socket.on("chat message: ", msg => {
//         io.emit("chat Message", msg);
//         console.log(msg);
//     })
// });

// server.listen(port, () => console.log("Server is running on port: " + port));

const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://192.168.100.27:3000"
    }
});

//generates rando string as the ID 
const generateTD = () => Math.random().toString(36).substring(2, 10);

let chatRooms =[

]

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    //socket connection to chat room
    socket.on("CreateRoom", (roomName) => {
        socket.join(roomName);
        //this willadd the new group name to the chat rooms array above
        chatRooms.unshift({id: generateTD(), roomName, messages:[]})
        //this will return the updated chat rooms via another event
        socket.emit("roomsList", chatRooms);
    })

    //listener to find the created room
    socket.on("findRoom", (id) => {
        let result = chatRooms.filter((room) => room.id ==id);
        socket.emit("foundRoom", result[0].messages);
    })

    //listener for new messages
    socket.on("newMessage", (data) => {
        const {room_id, message, user,timestamp} = data
        let result = chatRooms.filter((room) =>  room_id == room_id);

        const newMessage ={
            id: generateTD(),
            text: message,
            user,
            time: `${timestamp.hour}:${timestamp.mins}`,
        };

        //updates the chatroom messages
        socket.io(result[0].name).emit("roomMessage", newMessage);
        result[0].messages.push(newMessage);

        //triggrt te events to reflet the new changes
        socket.emit("roomsList", chatRooms);
        socket.emit("foundRoom", result[0].messages)

    })


    socket.on('disconnect', () => {
      socket.disconnect()
      console.log('🔥: A user disconnected');
    });
});

app.get("/api", (req, res) => {
    res.json(chatRooms);
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
