import sbase from "./suprabaseClient.js"
import {CronJob} from 'cron'
export const syncNotebooksToDB = async (notebookText)=>{
    try {
        if(notebookText.size == 0) return 
        let numUUid = Array.from(notebookText.keys())
        for(let notebookid of numUUid){
            if (!isUUID(notebookid)) continue
            let _notebook =  (await sbase.from('notebook').select().eq('notebookid',notebookid)).data
            console.log(_notebook);
            if(_notebook.length == 0 || _notebook[0].data != notebookText.get(notebookid)){
                let {_notebookUpdated , error} =  await sbase.from('notebook').upsert({'notebookid':notebookid , 'data':notebookText.get(notebookid)})
                if(error){
                    console.log(` == Notebook faced error while updating == ${error}`);
                }
                console.log(` == Notebook updated == ${notebookid}`);
                let s = notebookText.delete(notebookid)
                console.log(`== map cleared == ${s}`);
            }
        }
    } catch (error) {
        console.log(`Error in sycnNotebook  ${error}`);
    }
}


export const notebookSyncCronJob = (notebookText)=>{
    
    const job = CronJob.from({ 
        cronTime:'*/60 * * * *' , 
        onTick:()=>syncNotebooksToDB(notebookText)
    })
    return job
}

export const checkDataInNotebook = async (notebookid) =>{
    try {
        let _notebook =  (await sbase.from('notebook').select().eq('notebookid',notebookid)).data
        return _notebook.length == 0 ? null : _notebook[0].data
    } catch (error) {
        console.log(`Error in CheckDataInNotebook ${error}`);
    }
}

function isUUID ( uuid ) {
    let s = "" + uuid;

    s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    if (s === null) {
      return false;
    }
    return true;
}