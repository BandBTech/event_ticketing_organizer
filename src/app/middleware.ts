// import { NextResponse } from "next/server";
// import  type { NextRequest } from "next/server";

// export function middleware(req: NextRequest){
//     const token = req.cookies.get("auth_token")?.value;
//     const role = req.cookies.get("user_role")?.value;
//     const url = req.nextUrl.clone();

//     if(!token){
//         if(url.pathname.startsWith("/organizerDashboard") || url.pathname.startsWith("/staffDashboard")){
//             url.pathname = "/auth/pages/login";
//             return NextResponse.redirect(url);
//         }
//         return NextResponse.next();

//     }
            
//         if(url.pathname.startsWith("/staffDashboard") && role!== "staff"){
//             url.pathname = "/auth/pages/login";
//             return NextResponse.redirect(url);
//     }
//       if (
//     (url.pathname.startsWith("/auth/pages/login") ||
//       url.pathname.startsWith("/auth/pages/signup")) &&
//     token
//   ) {
//     if (role === "organizer") {
//       url.pathname = "/organizerDashboard";
//     } else if (role === "staff") {
//       url.pathname = "/staffDashboard";
//     }
//     return NextResponse.redirect(url);
//   }

//   return NextResponse.next();


// }

// export const config = {
//   matcher: ["/organizerDashboard/:path*", "/staffDashboard/:path*"],
// };