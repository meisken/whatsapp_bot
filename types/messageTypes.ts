export interface JsonDataType{

    [phone: string]:  MessageRecord[]
   
 
 }
export interface MessageRecord{
    [time: string]: MessageSchema
}
export interface MessageSchema{
    
    message: string,
    hasMedia: boolean,
    mediaFilename?: string

}
