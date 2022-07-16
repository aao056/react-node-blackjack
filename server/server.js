const http = require('http')
const app = require('./app')
const express = require('express')
const path = require('path')

const {addPlayer,
       hit,
       getPlayerCardsbyId,
       getOpponentCardsById,
       getPlayerHandNumericalValue,
       getPlayerNumberOfCards,
       getPlayersForRoom,
       getOpponentHandValue,
       deletePlayer,
       redealCards} = require('./models/player')

const {httpGetWinner} = require('./controllers/blackjack.controller')

const PORT = process.env.PORT || 5050


app.use(express.static(path.join(__dirname,'public')));



const server = http.createServer(app).listen(PORT , () => {
    console.log(`Started listening on port ${PORT}`)
})

const io = require('socket.io')(server,{
    cors: {
        origin: ["http://localhost:3000","*.herokuapp.com/"],
        methods: ["GET", "POST"]
    }
})

const {createGame,
       gameExists,
       getAllGames,
       removeGame} = require('./models/blackjack')



const rooms = { }


app.put('/api/v1/blackjack/create' , async (req,res) => {

    const room = await createGame()

    rooms[room] = { users: {} , done : 0 , restart: 0}

    res.send(room)

})


//SOME ENDPOINTS ARE FOR TESTING PURPOSES
app.get('/api/v1/blackjack/getall' , (req,res) => {
    return res.status(200).json(getAllGames())
})

app.get('/api/v1/blackjack/:id' , (req,res) => {
    if (rooms[req.params.id] == null) {
        return res.redirect('/')
    }
    res.status(200).send('it works')
})

app.get('/api/v1/blackjack/:id/exists' , (req,res) => {
    res.send(gameExists(req.params.id))
})

app.get('/api/v1/blackjack/player/:playerid/cards' , (req,res) => {
    res.send(getPlayerCardsbyId(req.params.playerid))
})

app.put('/api/v1/blackjack/player/:playerid/cards' , (req,res) => {
    res.send(getPlayerCardsbyId(req.params.playerid))
})

app.get('/api/v1/blackjack/player/:playerid/opponent/cards' , (req,res) => {
    res.send(getOpponentCardsById(req.params.playerid))
})

app.put('/api/v1/blackjack/:id/player/:playerid/hit' , async (req,res) => {
    await hit(req.params.id,req.params.playerid)
    res.status(200).send("done")
})

app.get('/api/v1/blackjack/player/:playerid/cards/num' , (req,res) => {
    res.send(getPlayerNumberOfCards(req.params.playerid)
    .toString())
})

app.get('/api/v1/blackjack/player/:playerid/handval' , (req,res) => {
    res.send(getPlayerHandNumericalValue(req.params.playerid)
    .toString())
})

app.get('/api/v1/blackjack/:id/players' , (req,res) => {
    res.send(getPlayersForRoom(req.params.id))
})

app.get('/api/v1/blackjack/player/:playerid/opponent/handval' , (req,res) => {
    res.send(getOpponentHandValue(req.params.playerid)
    .toString())
})

app.get('/api/v1/blackjack/:id/winner', httpGetWinner)





io.on('connection',socket => {
    socket.on('new-user', (room,name) => {
        if (Object.keys(rooms[room].users).length > 1) {
            socket.emit('room-full')
            socket.disconnect()
            return
        }

        if(Object.keys(rooms[room].users).length === 1) {
            socket.join(room)
            rooms[room].users[socket.id] = name

            addPlayer(socket.id,room,name).then((result) => {
                io.in(room).emit("both-joined");
                
            })
            
            return
        }

        console.log(socket.id)
        
        socket.join(room)
        rooms[room].users[socket.id] = name
        
      
        addPlayer(socket.id,room,name).then((result) => {})
        
    })

    socket.on('hit', (room,id) => {   
    
        hit(room,id).then((result) => {
            socket.to(id).emit('hit-card',result)
        })
        .catch((err) => {
            console.log(err)
        })
    })

    socket.on('done',(room) => {
        rooms[room].done ++;

        if(rooms[room].done >= 2 && rooms[room].done % 2 === 0){
            rooms[room].done = 0
            io.in(room).emit("both-done")
        }

    })

    socket.on('new-game', (room) => {
        rooms[room].restart ++;

        if(rooms[room].restart >= 2 && rooms[room].restart % 2 === 0){

            redealCards(room)

   
            io.in(room).emit("both-restart")
            rooms[room].restart = 0
        }

    })

    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
          socket.to(room).emit('user-disconnected')
          delete rooms[room].users[socket.id]
          const players = getPlayersForRoom(room)
          players.map((player) => {
              deletePlayer(player.id)
          })
          removeGame(room)

        })
     })
})

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
      if (room.users[socket.id] != null) names.push(name)
      return names
    }, [])
  }