import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { api } from "../common/api";
import { hashPassword } from "../common/password";
import {AdminLoginInput} from '../common/sdk'
import { signToken } from "../common/jwt";

const invalidUserorPassword = {
  statusCode: 404,
  body: JSON.stringify({message: 'User not found or password invalid'}),
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const {body} = event;
  const input: AdminLoginInput = JSON.parse(body!).input.admin;

  const data = await api.GetAdminByUsername(
    {username: input.username},
    {
      'x-hasura-admin-secret': 'myadminsecretkey'
    }
  )

  if (data.admin.length === 0) {
    return invalidUserorPassword
  }

  const hashedPassword = hashPassword(input.password)
  if (hashedPassword !== data.admin[0].password) {
    return invalidUserorPassword
  }


  const accessToken = signToken(data.admin[0].id)

  return {
    statusCode: 200,
    body: JSON.stringify({ accessToken }),
  };
};

export { handler };