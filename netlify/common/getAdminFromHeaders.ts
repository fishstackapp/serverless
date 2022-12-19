import { api } from "./api";
import { getTokenData, HASURA_CLAIMS, HASURA_USER_ID } from "./jwt";
import { GetAdminByIdQuery } from "./sdk";

export const getAdminFromHeaders = async (headers): Promise<GetAdminByIdQuery> => {
  const authHeader = headers['authorization'];

  if(!authHeader) {
    throw new Error(
      JSON.stringify({
        statusCode: 403,
        body: JSON.stringify({message: 'Forbidden'}),
      })
    )
  }

  const [_, authToken] = authHeader.split(' ');
  const adminObj = getTokenData(authToken);
  const adminID = adminObj[HASURA_CLAIMS][HASURA_USER_ID]

  const data = await api.GetAdminById(
    {id: adminID}, 
    {
    'x-hasura-admin-secret': 'myadminsecretkey'
    },
  );
  return data;
};