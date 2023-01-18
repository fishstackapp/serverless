import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { api } from '../common/api';
import { verifyHasura } from '../common/verifyHasura';
import { createNewCustomer } from '../hasura/create-new-customer';
import { sendNotificationToAdmin } from '../hasura/send-notification-to-admin';
import { HasuraEventBody, HasuraEvents } from '../dto/hasura-event-body.dto';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { headers, body: bodyRaw } = event;

  try {
    verifyHasura(headers);
  } catch (error) {
    return JSON.parse(error.message);
  }

  const body = JSON.parse(bodyRaw) as HasuraEventBody;

  const {
    trigger: { name: triggerName },
  } = body;

  if (triggerName === HasuraEvents.ORDER_CREATED) {
    await Promise.all([createNewCustomer(body), sendNotificationToAdmin(body)]);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'OK',
    }),
  };
};

export { handler };
