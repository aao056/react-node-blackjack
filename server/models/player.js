const axios = require('axios')


const players = []

function getPlayerbyId(id){
    return players.find((player) => {
        return player.id === id
    })
}

function getPlayerCardsbyId(id){
    const player = getPlayerbyId(id)

    return player.cards
}

function getOpponentCardsById(id){

    const player = getPlayerbyId(id)

    const opponent = players.find((playerr) => {
        return player.room === playerr.room && player.id !== playerr.id
    })


    return opponent.cards
}

function getOpponentHandValue(id){

    const player = getPlayerbyId(id)

    const opponent = players.find((playerr) => {
        return player.room === playerr.room && player.id !== playerr.id
    })


    return getPlayerHandNumericalValue(opponent.id)
}

async function dealCards(num){

    return await axios
    .get(`https://deckofcardsapi.com/api/deck/new/draw/?count=${num}`)
    .then((response) => {
        return response.data.cards
     })

}

async function hit(roomId,playerId) {
    
    const player = getPlayerbyId(playerId)

    const card = await dealCards(1)

    player.cards = [...player.cards , card[0]]

    return card[0]
}

async function addPlayer(id,room,name){

    const player = {
        room : room,
        id: id,
        name: name,
    }

    player.cards = await dealCards(2)

    players.push(player)

}

function getAllPlayers(){
    
    return players
}

function deletePlayer(id){
    const index = players.indexOf(id)

    if (index > -1) { 
        array.splice(index, 1); 
    }


    return "done"

}

function getPlayerHandNumericalValue(id){
    const cards = getPlayerCardsbyId(id)
    let total = 0
    cards.forEach(card => {
        const values = {
            ACE: 11,
            KING: 10,
            QUEEN: 10,
            JACK: 10
          }
          total = total + (values[card.value] || parseInt(card.value));
    });

    return total

}

function getPlayerNumberOfCards(id){
    const cards = getPlayerCardsbyId(id)

    return cards.length
}

function getPlayersForRoom(roomId) {
    return players.filter((player) => player.room === roomId)
}

function redealCards(roomId){
    const players = getPlayersForRoom(roomId)

    players.map((player) => {
        dealCards(2).then((result) => {
            player.cards = result
        })
    })


}


module.exports = {
    getPlayerbyId,
    addPlayer,
    getAllPlayers,
    getPlayerCardsbyId,
    getOpponentCardsById,
    hit,
    getPlayerNumberOfCards,
    getPlayerHandNumericalValue,
    getPlayersForRoom,
    getOpponentHandValue,
    deletePlayer,
    redealCards
}