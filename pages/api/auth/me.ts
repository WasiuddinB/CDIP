import {NextApiRequest, NextApiResponse} from "next";
import validator from "validator";
import bcrypt from "bcrypt";
import jose from "jose";
import jwt from "jsonwebtoken";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const bearerToken=req.headers["authorization"] as string;
    if(!bearerToken){
        res.status(401).json({errorMessage:"Unauthorized token(null bearer token)"
    });
    }
    const token=bearerToken.split(" ")[1];
    if(!token){
        res.status(401).json({errorMessage:"Unauthorized token(token)"
    });
    }
    const secret=new TextEncoder().encode(process.env.JWT_SECREATE);
    try {
        await jose.jwtVerify(token, secret);
    } catch (error) {
        res.status(401).json({errorMessage:"Unauthorized token(token not verified)"
    });
    }
    const payload=jwt.decode(token) as {email:string};
    if(!payload.email){
        res.status(401).json({errorMessage:"Email not found"
    });
    }
    const user=await prisma.user.findUnique({
        where:{
            email:payload.email
        }
    });
    return res.json(user);
}