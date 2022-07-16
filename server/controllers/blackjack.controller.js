const {getPlayerNumberOfCards,
       getPlayerHandNumericalValue,
       getPlayersForRoom} = require('../models/player')


function httpGetWinner(req,res) {
    const players = getPlayersForRoom(req.params.id)
    const player = players[0]
    const opponent = players[1]

    const playerNumberOfCards = getPlayerNumberOfCards(player.id)
    const opponentNumberOfCards = getPlayerNumberOfCards(opponent.id)

    const playerHandNumericalValue = getPlayerHandNumericalValue(player.id)
    const opponentHandNumericalValue = getPlayerHandNumericalValue(opponent.id)


    if(playerHandNumericalValue > 20 && opponentHandNumericalValue > 20){
    
        return res.send("Tie")
    }

    if((playerHandNumericalValue === opponentHandNumericalValue)
    && (playerNumberOfCards === opponentNumberOfCards ) ) {
        return res.send("Tie")
    }

    if(playerHandNumericalValue > 20 && opponentHandNumericalValue <= 20){
        return res.send(opponent.id)
    }

    if(playerHandNumericalValue <= 20 && opponentHandNumericalValue > 20){
        return res.send(player.id)
    }

    if(playerHandNumericalValue === opponentHandNumericalValue){
        if(playerNumberOfCards > opponentNumberOfCards){
           return res.send(player.id)
        }
       return res.send(opponent.id)
    }

    if(playerNumberOfCards === opponentNumberOfCards){

        if(playerHandNumericalValue > opponentHandNumericalValue){
           return res.send(player.id)
        }
        return res.send(opponent.id)
    }


    if(playerHandNumericalValue > opponentHandNumericalValue){
        return res.send(player.id)
    }

    if(opponentHandNumericalValue > playerHandNumericalValue){
        return res.send(opponent.id)

    }

}


module.exports = {
    httpGetWinner
}