import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { hashPassword } from "../common/password";
import { signToken } from "../common/jwt";
import { api } from "../common/api";
import {AdminRegisterInput} from '../common/sdk'


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
  const password = hashPassword(input.password)

  const data = await api.InsertAdmin(
    {
      username: input.username,
      password
    },
    {
      'x-hasura-admin-secret': 'myadminsecretkey'
    }
  )

  const accessToken = signToken(data.insert_admin_one?.id)

  return {
    statusCode: 200,
    body: JSON.stringify({ accessToken }),
  };
};

export { handler };