var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { response } = require("../app");

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      const data= await db.get().collection(collection.USER_COLLECTION).insertOne(userData);
      resolve(data.insertedId);
    });
  },
  doLogin: (loginData) => {
    return new Promise( async(resolve,reject)=>{
         const user=await db.get().collection(collection.USER_COLLECTION).findOne({email:loginData.email})
         if(user){
            bcrypt.compare(loginData.Password,user.password).then((status)=>{
                if(status) {
                    console.log("login success");   
                    const response = {
                        user: user,
                        status: true
                    }; 
                    resolve(response); 
                } else {
                    console.log("login failed password mimatching");
                    resolve({status:false})
                }
            })
         }else {
            console.log("auth failed");
            resolve({status:false})
            
         }
         console.log(user);
         
    })
    
  }
};
