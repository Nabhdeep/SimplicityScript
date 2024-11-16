import expess from 'express'
import { config } from './config.js';
import morgan from 'morgan';
import {createServer} from 'http'
import { Server } from 'socket.io';
import { randomUUID } from 'crypto';
import rateLimit from 'express-rate-limit'
import sbase from './suprabaseClient.js';
import cors from 'cors'
import { notebookSyncCronJob  , checkDataInNotebook} from './cron.js';


//Express
const nodeBookMap = new Map()
const notebookText = new Map() 
const app = expess()
const httpSever = createServer(app)

//limiter
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max:10,
})
//socket
const io = new Server(httpSever , {
    cors:{
        origin:['http://localhost:5173/'],
        methods:['GET' , 'POST'],
        credentials:true
    }
})



io.on('connection' , (socket)=>{
    socket.on('connect_notebook' , async (arg)=>{
        console.log(` == notebook == connect == req == ${arg}`);
        socket.join(arg)
        await handleSocket(socket , nodeBookMap , arg)
    })

    socket_update_text(socket)
})


const  socket_update_text = async (socket)=>{

    socket.on('update_text' , (arg)=>{
        //{uuid}:{socketID}:{value}
        // console.log('ARG', arg);
        const [noteBookId ,socketID , text ] = arg.split(':')
        // console.log(` == notebookid ${noteBookId} == ,  === Socket id  ${socketID} === , ==== text ${text} ====`);
        addTextToNotebook(noteBookId , text)
        if(text){
            socket.to(noteBookId).emit('update_text_broadcast', `${noteBookId}:${text}`)
        }
        // console.log(noteBookId , notebookText , text)
    })
}
app.use(cors())
app.use(morgan("tiny"))



function addTextToNotebook(key , value){
    // console.log('====================== NOTEBOOK MAP with TEXT ======================');
    notebookText.set(key , value)
}

function addToNotebookMap(key , value){
    if(nodeBookMap.has(key)){
        nodeBookMap.get(key).add(value)
    }else{
        const socketIdSet = new Set()
        socketIdSet.add(value)
        nodeBookMap.set(key ,socketIdSet)
    }
}

async function handleSocket (socket , nodeBookMap , noteBookId) {
    addToNotebookMap(noteBookId , socket.id)
    let data  = await checkDataInNotebook(noteBookId)
    //{uuid}:{socketID}:{value}
    let currData = notebookText.get(noteBookId) || 0
    data = (data && data.length<currData.length) ? data:notebookText.get(noteBookId)
    if(data){
        socket.emit('init_text_broadcast', `${data}`)
    }
    console.log(socket.id , nodeBookMap , noteBookId);
}

app.get('/',limiter , (req , res)=>{
    const noteBookId = randomUUID()
    return res.status(200).json(noteBookId)
})

httpSever.listen(config.PORT , ()=>{
    console.log(`Server running at ${config.PORT}`);
})

notebookSyncCronJob(notebookText).start()