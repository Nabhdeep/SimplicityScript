import dotenv from 'dotenv'


dotenv.config()

const config = {
    PORT: process.env.PORT,
    SBASEURI:process.env.SBASEURI,
    SBASEKEY:process.env.SBASEKEY,
}

export {config}