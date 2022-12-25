import { config } from "../core/config";

export const verifyHasura = (headers) => {
  if (
    !headers['x-fishstack-secret-key'] ||
    headers['x-fishstack-secret-key'] !== config.hasuraFishstackSecret
  ) {
    throw new Error(
      JSON.stringify({
        statusCode: 403,
        body: JSON.stringify({
          message: "'x-fishstack-secret-key' is missing or value is invalid",
        }),
      })
    );
  }
};