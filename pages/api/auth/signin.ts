import {NextApiRequest, NextApiResponse} from "next";
import validator from "validator";
import bcrypt from "bcrypt";
import jose from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method==="POST"){
        console.log("Success bhaiya!!");
        const errors: string[]=[];
        const {email,password}=req.body;

        const validationSchema=[
            {
                valid:validator.isEmail(email),
                errorMessage: "Email is invalid",
            },
            {
                valid: validator.isLength(password,{min:1}),
                errorMessage: "Invalid password",
            },
        ];
        validationSchema.forEach((check)=>{
            if(!check.valid){
                errors.push(check.errorMessage);
            }
        });
        if(errors.length) return res.status(400).json({errorMessage:errors[0]});

        const userWithEmail = await prisma.user.findUnique({
            where:{
                email
            }
        })
        if (!userWithEmail) {
            return res.status(401).json({ errorMessage: "Email is Invalid!" });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRATE);
        const isMatch = await bcrypt.compare(password, userWithEmail.password)

        if (isMatch) {
            const alg = "HS256";

            const token = await new jose.SignJWT({ email: userWithEmail })
            
                .setProtectedHeader({ alg })
                .setExpirationTime("24h")
                .sign(secret)
            return res.status(200).json({ Hello: token });
        }

        else
            return res.status(400).json({ Hello: "error"})
    }
}