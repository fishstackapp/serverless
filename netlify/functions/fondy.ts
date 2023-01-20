import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { api } from '../common/api';
import { generateSignature } from '../common/generateSignatureFondy';
import { Payment_Status_Enum } from '../common/sdk';
import { FondyCallbackResponseDTO } from '../dto/fondy-callback-response.dto';

const keysFilter = (body: FondyCallbackResponseDTO) => (key: string) =>
  body[key] !== '' &&
  body[key] !== body.response_signature_string &&
  body[key] !== body.signature;

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { headers, body } = event;

  const fondyBody: FondyCallbackResponseDTO = JSON.parse(body);
  const signature = generateSignature(fondyBody, keysFilter);

  if (signature !== fondyBody.signature) {
    throw new Error('Invalid signature');
  }

  await api.UpdateOrderPaymentStatusById({
    id: fondyBody.order_id,
    payment_status:
      fondyBody.order_status === 'approved'
        ? Payment_Status_Enum.Succeeded
        : Payment_Status_Enum.Failed,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      headers,
    }),
  };
};

export { handler };
