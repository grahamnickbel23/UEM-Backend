export default function getMetaData ({
    userId, docTitle, uploadedBy
}){
    // figure out date 
    const date = new Date();

    // ideal time format from server date
    const idealTime = date.toLocaleTimeString("en-GB", { hour12: false });  // HH-MM-SS

    // ideal date format from server date
    const idealDate = date.toLocaleDateString("en-GB").split("/").join("-"); // DD-MM-YYYY

    // return in idea format
    return{
        'associated to' : userId,
        'document title' : docTitle,
        'uploaded by' : uploadedBy,
        'time of uploading' : idealTime,
        'date of uploading' : idealDate
    }
}