import { User } from "./api";

export type AuthState =  {status : "loading"}
| {status : "authenticated", user : User}
| {status : "error", message : string}