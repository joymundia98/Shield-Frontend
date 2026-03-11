import { jwtDecode } from "jwt-decode"

interface JwtPayload {
  exp?: number
}

export const getTokenExpiry = (token: string) => {
  try {
    const decoded = jwtDecode<JwtPayload>(token)

    if (!decoded.exp) return null

    return decoded.exp * 1000
  } catch {
    return null
  }
}