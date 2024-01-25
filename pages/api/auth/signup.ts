import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import validator from "validator";

const prisma = new PrismaClient();

export default async function handler(
    req:NextApiRequest,
    res:NextApiResponse
    ){
        const {firstName,lastName, email, password, phone, city} = req.body;
        const errors:string[]=[];
        if(req.method === "POST"){
        const validationSchema=[
            {
                valid: validator.isLength(firstName, {
                    min: 1,
                    max: 20,
                }),
                errorMessage: "First name is invalid"
            },
            {
                valid: validator.isLength(lastName,{
                    min: 1,
                    max: 20,
                }),
                errorMessage: "Last name is invalid"
            },
            {
                valid: validator.isMobilePhone(phone),
                errorMessage: "Invalid phone number"
            },
            {
                valid: validator.isEmail(email),
                errorMessage: "Invalid email address"
            },
            {
                valid: validator.isStrongPassword(password),
                errorMessage: "Invalid password"
            },
        ]
        const userWithEmail = await prisma.user.findUnique({
            where:{
                email
            }
        });
        if(userWithEmail){
            return res.status(400).json({errorMessage: "Email is associated with another user"});
        }

        validationSchema.forEach((check)=>{
            if(!check.valid){
                errors.push(check.errorMessage);
            }
        });
        if(errors.length){
            return res.status(400).json({errorMessage: errors[0]});
        }
        return res.status(200).json({Hello: "Post..."});
    }

        // return res.status(200).json({Hello: "Get..."});
}