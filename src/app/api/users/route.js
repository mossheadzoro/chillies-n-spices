import {isAdmin} from "@/app/api/auth/[...nextauth]/route";
import {User} from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
  mongoose.connect("mongodb+srv://food-ordering:ldpQQODlMZo24b8I@cluster0.tjhvwss.mongodb.net/food-ordering");
  if (await isAdmin()) {
    const users = await User.find();
    return Response.json(users);
  } else {
    return Response.json([]);
  }
}