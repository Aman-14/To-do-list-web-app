exports.getDate=()=>{
    const today = new Date();
    const options = {
        day : "numeric" , 
        weekday : "long" , 
        month : "long" ,
    }; 
    return today.toLocaleDateString("en-US" , options);
}

exports.getDay=()=>{
    const today = new Date();
    const options = {
        weekday : "long" 
    }; 
    return today.toLocaleDateString("en-US" , options);
}