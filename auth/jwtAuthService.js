import jwt from "jsonwebtoken";

const checkAuth = (req,res,next)=>{
       const authHeader = req.headers.authorization;

       if(!authHeader || !authHeade.startsWith("Bearer ")){
        return res.status(401).json({message:"no token provided"});
       }
       const token = authHeader.split(" ")[1];

       try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
       } catch(err){
        if(err.name === "TokenExpiredError"){
            return res.status(401).json({message: "Token Expired"});
        }
        return res.status(401).json({message: "Invalid token"});
       }
};

export default checkAuth;