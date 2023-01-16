import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { api } from '../common/api';
import { verifyHasura } from '../common/verifyHasura';
import { config } from '../core/config';
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
    const {
      event: {
        data: { new: order },
      },
    } = body;
  
    await api.CreateNewCustomer({
      phone: order.client_phone,
      name: order.client_name,
      address: order.client_address,
    },
    {
      'x-hasura-admin-secret': config.hasuraAdminSecret,
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "OK"
    }),
  };
};

export { handler };
