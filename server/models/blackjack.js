const axios = require('axios')


const games = []

async function createGame(){

    const response = await axios
    .get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')


    games.push(response.data.deck_id)

    return response.data.deck_id
}

function getAllGames() {
    return games;
}

function gameExists(id){
    return games.includes(id)
}


function removeGame(id){
    const index = games.indexOf(id);

    if (index > -1) { 
        games.splice(index, 1); 
    }

    return "done"

}


module.exports = {
    createGame,
    getAllGames,
    gameExists,
    removeGame,

}