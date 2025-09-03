import mongoose from "mongoose";

export const connectDatabase = async (url:string)=>{
  mongoose.connect(url).then(()=>{console.log("Monogdb connected ✅")}).catch((error)=>{
    console.error(error);
  })
}