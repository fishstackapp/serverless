import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import axios from 'axios';
import crypto from 'crypto';
import { FondyDataResponse } from '../dto/fondy-checkout-uri-response.dto';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {

  const { headers } = event;

  const fondyPassword = 'test';

  const orderBody = {
    order_id: `fishStack_first_order_${Date.now()}`,
    merchant_id: '1396424',
    order_desc: 'Тарань x2, Ікряник x1',
    amount: 52500,
    currency: 'UAH',
  };

  const orderedKeys = Object.keys(orderBody).sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });

  const signatureRaw = orderedKeys.map((v) => orderBody[v]).join('|');
  const signature = crypto.createHash('sha1');
  signature.update(`${fondyPassword}|${signatureRaw}`);

  const { data } = await axios.post<FondyDataResponse>(
    'https://pay.fondy.eu/api/checkout/url/',
    {
      request: {
        ...orderBody,
        signature: signature.digest('hex'),
      },
    }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      data,
    }),
  };
};

export { handler };