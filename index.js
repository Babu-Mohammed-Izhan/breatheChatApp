
require('dotenv').config()
const express = require('express');
const app = express();
const server = require("http").createServer(app);
const cors = require('cors');
const Messages = require('./messages')
const bodyParser = require('body-parser')

var usernames = []

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('build'))


app.get('/api/messages', (request, response) => {
    Messages
        .find({})
        .then(messages => {
            response.json(messages)
        })

})



io.on("connection", socket => {
    console.log("new user joined")

    socket.on('username', ({ username }) => {
        console.log(`New user is ${username}`)
        usernames.push(username)
        io.emit('current users', usernames)
        io.emit('user joined', username);

        socket.once('disconnect', () => {
            var pos = usernames.indexOf(username);

            if (pos >= 0)
                usernames.splice(pos, 1);
        });
    }
    )


    socket.on('message', (msg) => {
        console.log(msg)
        io.emit('chat message', msg)
        const message = new Messages({
            username: msg.username,
            input: msg.input,
        })
        message.save().then((msg) => {
            console.log(msg)
        }).catch((e) => {
            console.log(e)
        })
    })

    socket.on('disconnect', () => {
        io.emit('user left');
        console.log('user disconnected');
    });
});

server.listen(8080, () => {
    console.log('listening on *:8080');
});