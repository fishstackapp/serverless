import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import {v2 as cloudinary} from 'cloudinary'
import { getAdminFromHeaders } from "../common/getAdminFromHeaders";
import { GetAdminByIdQuery } from "../common/sdk";
import { config } from '../core/config';

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
  secure: true,
});

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const {headers} = event;

  let admin: GetAdminByIdQuery;
  try {
    admin = await getAdminFromHeaders(headers);
  } catch (error) {
    return JSON.parse(error.message);
  }

  if (!admin.admin_by_pk?.id) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Forbidden' }),
    };
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const publicId = `menu-${timestamp}`;

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: 'menu',
      public_id: publicId,
    },
    config.cloudinaryApiSecret!
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      apiKey: config.cloudinaryApiKey,
      cloudName: config.cloudinaryCloudName,
      signature,
      timestamp,
      publicId,
    }),
  };
};

export { handler };