import { useEffect, useState , useRef } from 'react'
import './App.css'
import {io} from 'socket.io-client'
import { axiosInstance } from './axiosConfig'
import { useNavigate  } from 'react-router-dom'
import axios from 'axios'



const socket = io('http://localhost:9000' , {
  reconnectionDelayMax:100000,
  withCredentials:true,
  transports: ['websocket', 'polling']
})
const getPrarams = ()=>{
  const urlObj= new URL(window.location)
  return urlObj.pathname.split('/').slice(1)
}
function App() {
  const id = getPrarams()
  const [uuid , setUUID] = useState(id[0])
  const [textValue, setTextValue] = useState(''); 
  const navigate = useNavigate()
  const textValueRef = useRef('');

 

  useEffect(()=>{

    if(uuid){
      console.log('=== uuid ==' , uuid);
      socket.emit('connect_notebook' , uuid)
      setUUID(uuid)
    }else{
      axiosGenUUID()
    }
  } , [uuid])


  useEffect(() => {
    socket.on('update_text_broadcast', (broadcast_text) => {
      console.log('====== in comming broadcast =====');
      // {notebookid}:{text}
      const [notebookid , newText] = broadcast_text.split(':')
      console.log(`==== newText ${newText}  |||| stateText ${textValueRef.current} ====`);
      if( newText != textValueRef.current){
        console.log('====== new text ======');
        console.log(newText);
        setTextValue(newText);
        textValueRef.current = newText;
      }
    });
  
    return () => {
      socket.off('update_text_broadcast');
    };
  }, [textValue]); 


  // Emit text updates
  useEffect(() => {
    if (textValue != textValueRef.current) {
      socket.emit('update_text', `${uuid}:${socket.id}:${textValue}`);
      console.log(` == text updated == ${textValue}`);
      textValueRef.current = textValue;
    }
  }, [textValue]);


  const axiosGenUUID = async ()=>{
    try {
      const response = await axiosInstance.get()
      if(axios.isAxiosError(response)){ 
        setUUID('')
      }
      else {
        setUUID(response.data)
        socket.emit('connect_notebook' , response.data)
      }    
    } catch (error) {
      setUUID('')
    }
  }


  useEffect(() => {
    if (uuid) {
      console.log(uuid);
      navigate(`/${uuid}`)
    }
  }, [uuid]);

  const handleTextChange = (event) => {

    setTextValue(event.target.value); 
  }

  return (
    <>
    <textarea placeholder='Type here...'
    value={textValue}
    onChange={handleTextChange}  >     
    </textarea>
    </>
  )
}

export default App
