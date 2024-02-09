import mime from "mime-types"





const getFileExtensionFromMime: (mimetype: string) => (string | false) = (mimetype) => {
    const extension = mime.extension(mimetype);
    if(!extension){
        console.log("mimetype undefined");
        return false
    }else{
        return extension
    }
 
}


export { getFileExtensionFromMime }