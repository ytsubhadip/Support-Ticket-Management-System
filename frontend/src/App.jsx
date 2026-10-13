import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login/Login"
import ProtectRoute from "./components/ProtectRoute"
import Register from "./pages/Register/Register"
import Dashboard from "./pages/Dashboard/Dashboard"




function Tickets(){
  return <h1>Tickts Page</h1>
}


function App(){

  return(
    <BrowserRouter>
      <Routes>

        <Route path="/" element={ <Navigate to="/login" replace/>}/>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element ={<Register/>}/>

        <Route element={<ProtectRoute/>}>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/tickets" element={<Tickets/>}/>
        </Route>

      </Routes>
    
    </BrowserRouter>
  )
}

export default App;