import { NextResponse } from "next/server";

export async function POST(req: Request){
    try{
        const {email, password } = await req.json();
        const res = await fetch("https://sandbox.timroticket.com/api/v1/auth/login",{
            method: "POST",
            headers:{
                "Content-Type" : "application/json",

            },
            body: JSON.stringify({email, password}),

        });
        const data = await res.json();
        if(!res.ok){
            return NextResponse.json(
                {success: false, message: data.message || "Login failed : Invalid credentials"},
                {status: res.status}
            );
        }
        const response = NextResponse.json({success: true, user: data.user})
        response.cookies.set({
            name: "auth_token",
            value: data.token,
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path:"/",
        });


        return response;
    }catch(error){
        console.error(error);
        return NextResponse.json(
            {success: false, message:"Server Error"},
            {status: 500}
        );
    }

}