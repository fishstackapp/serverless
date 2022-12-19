import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { getTokenData, HASURA_CLAIMS, HASURA_USER_ID } from "../common/jwt";
import { api } from "../common/api";


const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const {headers} = event;
  const authHeader = headers['authorization'];

  if(!authHeader) {
    return {
      statusCode: 403,
      body: JSON.stringify({message: 'Forbidden'}),
    }
  }

  const [_, authToken] = authHeader.split(' ');
  const adminObj = getTokenData(authToken);
  const adminID = adminObj[HASURA_CLAIMS][HASURA_USER_ID]

  const data = await api.AdminGetMe(
    {id: adminID}, 
    {
    'x-hasura-admin-secret': 'myadminsecretkey'
    },
  )

  return {
    statusCode: 200,
    body: JSON.stringify({ id: adminID, username: data.admin_by_pk?.username }),
  };
};

export { handler };