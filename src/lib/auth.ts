import NextAuth from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/route";

export const auth = () => NextAuth(authOptions); 