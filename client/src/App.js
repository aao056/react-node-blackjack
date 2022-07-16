import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom"
import Main from './Main'
import Blackjack from './Blackjack'



function App() {


  return (
    <Router>
      <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/:roomId" element ={<Blackjack/>}></Route>
      </Routes>
    </Router>
  )

}

export default App;
