export const config = {
  //HASURA
  hasuraEndpoint: process.env.HASURA_ENDPOINT,
  hasuraAdminSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  hasuraFishstackSecret: process.env.HASURA_FISHSTACK_SECRET,
  // CLOUDINARY
  cloudinaryCloudName: process.env.CLOUD_NAME,
  cloudinaryApiKey: process.env.API_KEY,
  cloudinaryApiSecret: process.env.API_SECRET,
  //TWILIO
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioServiceSid: process.env.TWILIO_SERVICE_SID,
   // MISC
  jwtSecret: process.env.JWT_SECRET,
  passwordSalt: process.env.PASSWORD_SALT,
};