import React, { useState , useEffect} from 'react';
import axios from 'axios';
import './Blackjack.css';
import { io } from "socket.io-client";
import {
    useParams,
    useNavigate,
} from 'react-router-dom'


export default function Blackjack() {


  const { roomId } = useParams()

  const [playerHand,setPlayerHand] = useState([])
  const [opponentHand,setOpponentHand] = useState([])
  const [gameStatus,setGameStatus] = useState(`Waiting for opponent.. code: ${roomId}`)
  const [bothJoined,setBothJoined] = useState(false)
  const [exists,changeExists] = useState(false)
  const [playerHandVal,setPlayerHandVal] = useState()
  const [opponentHandVal,setOpponentHandVal] = useState()
  const [API_URL,set_API_URL] = useState('http://localhost:5050')

  const [hitShow,setHitShow] = useState(true)
  const [doneShow,setDoneShow] = useState(true)
  const [gameDone,setGameDone] = useState(false)


  const [clientId,setClientId] = useState()
  const socket = io()

  const navigate = useNavigate();



  async function checkIfRoomExists(roomId){
    const response = await axios
    .get(`${API_URL}/api/v1/blackjack/${roomId}/exists`)

    return response.data
  }


  async function getPlayerCards(id){
    const cards = await axios
    .get(`${API_URL}/api/v1/blackjack/player/${id}/cards`)

    return cards.data
  }

  async function getOpponentCards(id){
    const cards = await axios
    .get(`${API_URL}/api/v1/blackjack/player/${id}/opponent/cards`)


    return cards.data
  }
  async function countPlayerCards(id){
    const cards = await axios
    .get(`${API_URL}/api/v1/blackjack/player/${id}/cards/num`)

    return parseInt(cards.data)
  }

  async function getHandNumericalValue(id){

    const value = await axios
    .get(`${API_URL}/api/v1/blackjack/player/${id}/handval`)

    return parseInt(value.data)

  }

  async function getOpponentHandValue(id){

    const value = await axios
    .get(`${API_URL}/api/v1/blackjack/player/${id}/opponent/handval`)

    return parseInt(value.data)

  }

  function getBothHands(id){
    getPlayerCards(id).then((result) => {
      setPlayerHand(result)
      getHandNumericalValue(id).then((result) => {
        setPlayerHandVal(result)
      })
    })

    getOpponentCards(id).then((result) => {

      setOpponentHand(result)
      getOpponentHandValue(id).then((result) => {
        setOpponentHandVal(result)
      })
    })

  }


  async function hit(){

    setHitShow(false)

    socket.emit('hit',roomId,clientId)

    if(await(countPlayerCards(clientId)) > 3){
      done()
      return
    }

    setTimeout(async () => {
      setHitShow(true)
      if((await getHandNumericalValue(clientId)) > 20) {
        setHitShow(false)
        done()
      }
    },1000)
    
   
  }

  function done(){

    socket.emit('done',roomId)
    setGameStatus("Waiting for your opponent...")
    setHitShow(false)
    setDoneShow(false)

  }

   function checkWinner (id) {
     axios
    .get(`${API_URL}/api/v1/blackjack/${roomId}/winner`)
    .then((result) => {
      switch(result.data){
        case id:
          setGameStatus("You won")
          break
        case "Tie":
          setGameStatus("Tie")
          break
        default:
          setGameStatus("You lost")
        
      }
    })

  }

  function newGame () {

    socket.emit('new-game',roomId)


    setGameDone(false)
    setGameStatus("Waiting for your opponent")

  }


  useEffect(() => {
      
    checkIfRoomExists(roomId).then((result) => {
      if(result === true){
        changeExists(true)

        socket.emit('new-user',roomId,'Player 1')

        socket.on('room-full', () => {
          navigate("/")
          alert("That room is full")
        })

        socket.on('both-joined', () => {

          setClientId(socket.id)

          setGameStatus('Ready')
          setBothJoined(true)

          getBothHands(socket.id)

        
   
        })
        socket.on('hit-card' , (card) => {
          setPlayerHand(playerHand => [...playerHand,card])
          getHandNumericalValue(socket.id).then((result) => {
            setPlayerHandVal(result)
          })
        })

        socket.on('both-done',() => {
          getBothHands(socket.id)
          checkWinner(socket.id)
          setHitShow(false)
          setDoneShow(false)
          setGameDone(true)
        })

        socket.on('both-restart', () => {

          setGameStatus('Ready')
          setHitShow(true)
          setDoneShow(true)
          setTimeout(() => {
            getBothHands(socket.id)
          }, 500);

        })

        socket.on('user-disconnected', () => {
            navigate("/")
            alert("Opponent has left")
        })

      }
      else {
        navigate("/")
        alert("That room does not exist")
      }
    })

  },[])




  // async function hit(){
  //   await getFirstHand();
  // } 

  
  return (
    <>
    {exists && <div className="blackjack-page">

      <h1 className="top-section">Blackjack</h1>
      <div className="center">
        <p className="game-status">{gameStatus}</p>
      </div>
      <div className="center">
        <button className="reset hidden">Play Again!</button>
      </div>

      <div className="game-area">
        <div className="left">
          {bothJoined && hitShow && <button className= "hit" onClick = {() => hit()} >
            Hit
          </button>}
          <p>Your Cards:</p>
          <p className="player-total">{playerHandVal}</p>
          <div className="player-hand">
            {playerHand.map((card,key) => {
              return <img src={`${card.image}`} key={key} alt="card" />
            })}
          </div>
        </div>

        <div className="right">
          {bothJoined && doneShow && <button className="stay" onClick = {() => done()}>
            Done
          </button>}
          <p>Opponent Cards:</p>
          <p className="dealer-total">{opponentHandVal}</p>
          <div className="dealer-hand">
           {opponentHand.map((card,key) => {
              return <img src={`${card.image}`} key={key} alt="card" />
          })}
          </div>
        </div>
      </div>
     {gameDone && <div className="new-game">
        <button className="reset" onClick = {newGame}>
          New Game
        </button>
      </div>}
    </div>}
    </>
  )
}