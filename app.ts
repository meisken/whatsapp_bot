
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import qrcode from "qrcode-terminal"
import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js"
import { promises as fs } from 'fs';
import https from "https"
import cors from "cors";
import { removeSpace } from './utility/removeSpace';
import { updateJsonData } from './utility/updateJson';
import { getCurrentDate } from './utility/getCurrentDate';
import { getFileExtensionFromMime } from './utility/getFileExtensionFromMime';

// const key = fs.readFileSync('./cert/key.pem');

// const cert = fs.readFileSync('./cert/cert.pem');

dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT;

const client = new Client({
    authStrategy: new LocalAuth()
});

client.initialize();

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("Client is ready!");
});

client.on("authenticated", () => {
    console.log("AUTHENTICATED");
}); 

const commandDispatcher = process.env.commandDispatcher!
export interface actionParams{

}

const action: {[actionName: string]: (
    params?: actionParams
) => void} = {

    "someCommand": () => {
       
    },
}



client.on("message", async (message) => {
 

    const msg = message.body;
    const jsonFilepath = "./json/message.json";
    type Prefixes = "command:";
    const prefixes: {[key: string]: Prefixes} = {
        command: "command:",

    };
    
    const whatsappCommander = () => {
        if(message.from === commandDispatcher && msg.slice(0, 8) === prefixes.command){
     
            const separateParams = removeSpace(msg).split('/');
            
    
            const getParam: (paramType: Prefixes) => (string | undefined) = (paramType) => {
                const findCodePrefix = separateParams.find(param => param.includes(paramType));
                if(findCodePrefix){
                    const param = findCodePrefix.replace(paramType, "");
                    return param
                }else{
                    return undefined
                }
            }
    
            const command = getParam(prefixes.command);
    
    
            console.log(command);
            if(command !== undefined && action[command]){
                action[command]();
            }else{
                client.sendMessage(commandDispatcher, "command error")
            }
        
        }
    }
    //whatsappCommander();

    const saveMessageToJson = async () => {
        console.log(message.body)
        const currentTime = getCurrentDate(true);
        const mediaFolderPath = "./assets/"
        if(message.author !== undefined) {
            return
            //ignore group message
        }
        if(message.hasMedia){
            const media = await message.downloadMedia();
    
            let filename = media.filename;
            try{
                if(media.filename === undefined || media.filename === null){
                    filename = `${currentTime}.${getFileExtensionFromMime(media.mimetype)}`;
                 
                    await fs.writeFile(`${mediaFolderPath}/${filename}`, media.data, { encoding: "base64", flag: "wx"})
                    updateJsonData({
                        contact: message.from,
                        hasMedia: true,
                        jsonFilepath,
                        message: message.body,
                        mediaFilename: filename
                    })
               
                }else{
                    throw new Error("media filename is undefined")
                }
            }catch(err){
                client.sendMessage(commandDispatcher, `save media error: ${err}`)
            }
  
     
         
        }else{
            updateJsonData({
                contact: message.from,
                hasMedia: false,
                jsonFilepath,
                message: message.body
            })
        }
    }

    saveMessageToJson()

});



const server = https.createServer(/*{key: key, cert: cert },*/ app);

interface requestBody {
    message?: string,
    receiver?: string
}
app.post('/', (req: Request, res: Response) => {

    const receiver: requestBody["receiver"] = req.body.receiver;
    const message: requestBody["message"]= req.body.message;
    if(receiver && message ){
      
        client.sendMessage(receiver, message );
        return res.json({message: `message sent to ${receiver}: ${message }`}); 
    }else{
        return res.status(400).send({
            message: 'Error: receiver or message is undefined'
        })
    }


  
});                                

server.listen(port, () => {
    console.log('server is listening on port: ' + port);
});
