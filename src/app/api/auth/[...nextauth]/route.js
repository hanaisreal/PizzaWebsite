import NextAuth from "next-auth"
import bcrypt from 'bcrypt';
import CredentialsProvider from "next-auth/providers/credentials"
import {User} from '@/models/User';
import * as mongoose from 'mongoose';
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/libs/mongoConnect";

const handler = NextAuth({
  secret: process.env.SECRET,
  adapter: MongoDBAdapter(clientPromise),
  session: {
    // Set it as jwt instead of database
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      id: 'credentials',
      credentials: {
        username: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log({credentials})
        const email = credentials?.email;
        const password = credentials?.password;

        console.log("email:" + email)

        mongoose.connect(process.env.MONGO_URL);
        const user = await User.findOne({email});
        const passwordOk = user && bcrypt.compareSync(password, user.password);

        console.log("password:"+ passwordOk);
        console.log("password:"+ password);
        if (passwordOk) {
          return user;
        }
        // Return null if user data could not be retrieved
        return null
      }
    })
  ],
});



export { handler as GET, handler as POST }