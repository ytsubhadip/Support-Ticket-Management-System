import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login/Login"
import ProtectRoute from "./components/ProtectRoute"

// function Login(){
//   return <h1>Login Page</h1>
// }

function Register(){
  return <h1>Register Page</h1>
}

function Dashboard(){
  return <h1>Support Ticket Dashboard</h1>
}

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