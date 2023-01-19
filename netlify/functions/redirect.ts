import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { config } from "../core/config";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const {headers, queryStringParameters} = event;

  const {url} = queryStringParameters;

  return {
    statusCode: 302,
    headers: {
      location: url || config.clientFrontendURL,
    }
  };
};

export { handler };