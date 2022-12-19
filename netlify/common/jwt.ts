import jwt from "jsonwebtoken";

const JWT_SECRET = '9PC62hi1eXCt5RJ2lNeV3fTYLBeywbf7'

export const HASURA_CLAIMS = 'https://hasura.io/jwt/claims'
export const HASURA_USER_ID = 'x-hasura-user-id'

export const signToken = (id: string) => {
  return jwt.sign({
    [HASURA_CLAIMS]: {
    "x-hasura-allowed-roles": ["admin"],
    "x-hasura-default-role": "admin",
    [HASURA_USER_ID]: id,
    }
  }, JWT_SECRET) 
}

export const getTokenData = (token: string) => {
  return jwt.verify(token, JWT_SECRET )
}