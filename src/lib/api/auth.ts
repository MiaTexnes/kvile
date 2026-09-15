import type {
  ApiResponse,
  HolidazeProfile,
  LoginResponseData,
  RegisterRequestBody,
} from "../types"
import { holidazeFetch } from "./client"

export async function registerUser(
  body: RegisterRequestBody,
): Promise<HolidazeProfile> {
  const json = await holidazeFetch<ApiResponse<HolidazeProfile>>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  )
  return json.data
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponseData> {
  const json = await holidazeFetch<ApiResponse<LoginResponseData>>(
    "/auth/login?_holidaze=true",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  )
  return json.data
}
