import expess from 'express'
import { config } from './config.js';
import morgan from 'morgan';
import {createServer} from 'http'
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import cors from 'cors'

//Express
const nodeBookMap = new Map()
const notebookText = new Map() 
const app = expess()
const httpSever = createServer(app)

//socket
const io = new Server(httpSever , {
    cors:{
        origin:['http://localhost:5173/'],
        methods:['GET' , 'POST'],
        credentials:true
    }
})

//Db connection
const sbase = createClient(config.SBASEURI , config.SBASEKEY)


io.on('connection' , (socket)=>{
    socket.on('connect_notebook' , (arg)=>{
        console.log(` == notebook == connect == req == ${arg}`);
        handleSocket(socket , nodeBookMap , arg)
    })

    socket.on('update_text' , (arg)=>{
        //{uuid}:{socketID}:{value}
        console.log('ARG', arg);
        const [noteBookId ,socketID , text ] = arg.split(':')
        console.log(` == notebookid ${noteBookId} == ,  === Socket id  ${socketID} === , ==== text ${text} ====`);
        addTextToNotebook(noteBookId , text)
        console.log(notebookText);
        if(text){
            socket.broadcast.emit('update_text_broadcast', `${noteBookId}:${text}`)
        }
        // console.log(noteBookId , notebookText , text)
    })
})

app.use(cors())
app.use(morgan("tiny"))



function addTextToNotebook(key , value){
    console.log('====================== NOTEBOOK MAP with TEXT ======================');
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

function handleSocket (socket , nodeBookMap , noteBookId) {
    addToNotebookMap(noteBookId , socket.id)
    console.log(socket.id , nodeBookMap , noteBookId);
}

app.get('/' , (req , res)=>{
    const noteBookId = randomUUID()
    return res.status(200).json(noteBookId)
})

httpSever.listen(config.PORT , ()=>{
    console.log(`Server running at ${config.PORT}`);
})
