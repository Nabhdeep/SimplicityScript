import expess from 'express'
import { config } from './config.js';
import morgan from 'morgan';
import {createServer} from 'http'
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

//Express
const nodeBookMap = new Map() 
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


io.on('connection' , (socket)=>handleSocket(socket , nodeBookMap , socket.id))

app.use(morgan("tiny"))



function handleSocket (socket , nodeBookMap , noteBookId) {
    console.log(socket.id , nodeBookMap , noteBookId);
}

app.get('/' , (req , res)=>{
    const noteBookId = randomUUID()
    return res.status(200).redirect(`/${noteBookId}`)
})

app.get('/:uuid' , (req , res)=>{
    const noteBookid = req.params.uuid
    handleSocket(io , nodeBookMap , noteBookid)
    return res.status(200).json({'msg':req.params.uuid})
})
httpSever.listen(config.PORT , ()=>{
    console.log(config);
    console.log(`Server running at ${config.PORT}`);
})
