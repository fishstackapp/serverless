import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import jwt from "jsonwebtoken";
import { getSdk } from "../common/sdk";
import { GraphQLClient } from 'graphql-request'
import crypto from 'crypto'


interface AdminRegisterInput {
  username: string;
  password: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const {body, headers} = event;

  if(!headers['x-fishstack-secret-key'] || headers['x-fishstack-secret-key'] !== 'secret-key'){
    return {
      statusCode: 403,
      body: JSON.stringify({ 
        message: "'x-fishstack-secret-key' is missing or value is invalid"
      }),
    };
  }

  const input: AdminRegisterInput = JSON.parse(body!).input.admin;
  const sdk = getSdk(new GraphQLClient('http://localhost:8080/v1/graphql'))
  // 
  const password = crypto.pbkdf2Sync(input.password, 'mygreatsaltsecret', 1000, 64, 'sha512').toString('hex')

  const data = await sdk.InsertAdmin({
    username: input.username,
    password

  })


  const accessToken = jwt.sign({
    "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": ["admin"],
    "x-hasura-default-role": "admin",
    "x-hasura-user-id": data.insert_admin_one?.id,
    }
  }, 'mygreatjwtsecret') 

  return {
    statusCode: 200,
    body: JSON.stringify({ accessToken: accessToken }),
  };
};

export { handler };