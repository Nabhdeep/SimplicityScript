import axios from 'axios'
import { defaultValues } from './defaultvalues'
export const axiosInstance = axios.create({
    baseURL:defaultValues.serverBaserUri
})

