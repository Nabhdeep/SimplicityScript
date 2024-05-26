import { useEffect, useState , useRef } from 'react'
import './App.css'
import {io} from 'socket.io-client'
import { axiosInstance } from './axiosConfig'
import { useNavigate  } from 'react-router-dom'
import { defaultValues } from './defaultvalues'
import axios from 'axios'



const socket = io(defaultValues.serverBaserUri , {
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
  const [theme , setTheme] = useState('dark')
  const [textValue, setTextValue] = useState(''); 
  const navigate = useNavigate()
  const textValueRef = useRef('');


  useEffect(()=>{
    let th = localStorage.getItem('themePreference')
    if(th && ['dark' , 'light'].includes(th)) setTheme(th)
  },[])
 
  useEffect(()=>{
    if(uuid){
      console.log('=== uuid ==' , uuid);
      socket.emit('connect_notebook' , uuid)
      setUUID(uuid)
    }else{
      axiosGenUUID()
    }
  } , [uuid])
  
  socket.on('init_text_broadcast' , (init_text)=>{
    setTextValue(init_text)
  })
  

  useEffect(() => {
    socket.on('update_text_broadcast', (broadcast_text) => {
      console.log('====== in comming broadcast =====');
      // {notebookid}:{text}
      const [notebookid , newText] = broadcast_text.split(':')
      // console.log(`==== newText ${newText}  |||| stateText ${textValueRef.current} ==== ||||| notebookid ${notebookid} |||||| uuid ${uuid}`);
      if(notebookid === uuid && newText != textValueRef.current){
        // console.log('====== new text ======');
        // console.log(newText);
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
      // console.log(` == text updated == ${textValue}`);
      textValueRef.current = textValue;
    }
  }, [textValue]);

  useEffect(()=>{
    let ColorMap = {
      'light':{
        'bg':'#FFEFDC',
        'scheme':'light'
      },
      'dark':{
        'bg':'#242424',
        'scheme':'light dark'
      }
    }
    let newBgColor = ColorMap[theme]['bg']
    let newColorScheme = ColorMap[theme]['scheme']
    document.documentElement.style.setProperty('--background-color',newBgColor)
    document.documentElement.style.setProperty('--color-scheme',newColorScheme)
  },[theme])


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
      navigate(`/${uuid}`)
    }
  }, [uuid]);

  const handleTextChange = (event) => {

    setTextValue(event.target.value); 
  }
  
  function handleClick(){
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      localStorage.setItem('themePreference', newTheme);
  }
  return (
    <>
    <button onClick={handleClick}>
    <span className='emoji'>{theme === "dark" ? "🌑" : "🌅"}</span>
    </button>
    <textarea placeholder='Type here...'
    value={textValue}
    spellCheck='false'
    onChange={handleTextChange}  >     
    </textarea>
    </>
  )
}

export default App
