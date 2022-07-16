import React,{useRef,useState} from 'react'
import {Button,Form,Container} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'
import './Main.css'
import {useNavigate} from 'react-router-dom'



export default function Main() {
    const roomId = useRef()
    const navigate = useNavigate()
    const PORT = process.env.PORT || 5050


    const [API_URL,set_API_URL] = useState('http://localhost:5050')


     function createRoom(){
        const response = axios
        .put(`${API_URL}/api/v1/blackjack/create`)
        .then((result) => {
            navigate(`/${result.data}`)
        });

     }

    function joinRoom(e){

      e.preventDefault()
    
      const id = roomId.current.value

      navigate(`/${id}`)

    }
      return (
        <Container className = "align-items-center d-flex" style = {{height:
          '100vh' }}>
              <Form onSubmit = {joinRoom} className = "w-50">
                  <Form.Group>
                      <Form.Label>Enter room id</Form.Label>
                      <Form.Control className = "mb-2" type="text" ref = {roomId} required/>
                  </Form.Group>
                  <Button type="submit" className = "me-2"> Join a Room </Button>
                  <Button variant= "secondary" onClick={createRoom}>Create a new room</Button>
              </Form>
          </Container>
      );
}
