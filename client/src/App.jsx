import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {io} from 'socket.io-client'
import { axiosInstance } from './axiosConfig'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'



const socket = io('http://localhost:9000' , {
  reconnectionDelayMax:100000,
  withCredentials:true,
  transports: ['websocket', 'polling']
})
function App() {
  const [count, setCount] = useState(0)
  const [uuid , setUUID] = useState('')
  const navigate = useNavigate()
  
  useEffect(() => {
    // Emit the initial count
    socket.emitWithAck('incCount', count);
  }, [count]);

  const axiosGenUUID = async ()=>{
    try {

      const response = await axiosInstance.get()
      if(axios.isAxiosError(response)){ 
        console.log('ERRORORORORO' ,response);
        setUUID('')
      }
      else {
        setUUID(response.data)
      }
      console.log(uuid);
      
    } catch (error) {
      setUUID('')
    }
  }
  useEffect( ()=> {axiosGenUUID()}, [])


  
  useEffect(() => {
    if (uuid) {
      // window.location.href = `/${uuid}`;
      navigate(`/${uuid}`)
    }
  }, [uuid]);
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
