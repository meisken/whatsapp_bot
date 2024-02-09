
import { promises as fs } from 'fs';
import { getCurrentDate } from "./getCurrentDate";
import { JsonDataType, MessageSchema } from '../types/messageTypes';


interface UpdateJsonDataParams extends MessageSchema{

    jsonFilepath: string, 
    contact: string

}
export const updateJsonData: (params: UpdateJsonDataParams) => Promise<void> = ({
    jsonFilepath, 
    message, 
    contact,
    hasMedia,
    mediaFilename
} ) => {
    return new Promise<void>(async (resolve,reject) => {

        try{
            const rawJsonData = await fs.readFile(jsonFilepath, 'utf8');
            const jsonData = JSON.parse(rawJsonData) as JsonDataType;
            const currentTime = getCurrentDate(true);

            if(!jsonData[contact]){
                jsonData[contact] = []
            }
            
            jsonData[contact].push({
                [currentTime]: {
                    message,
                    hasMedia,
                    mediaFilename
                }
            })
            await fs.writeFile(jsonFilepath, JSON.stringify(jsonData, null, 4 ))
            resolve()
        }catch(err){
            reject(err)
        }
        
    })
}

