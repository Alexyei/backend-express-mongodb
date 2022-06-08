import cron from 'node-cron'
import {delAll} from "../dao/userLimitsDAO";


export default function cronStart(){
    //каждый день в полночь
    cron.schedule('0 0 * * *', async () =>  {
        await delAll();
    });
}