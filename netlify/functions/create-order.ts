import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { api } from '../common/api';
import { CreateOrderInput, Payment_Types_Enum } from '../common/sdk';
import { verifyHasura } from '../common/verifyHasura';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { headers, body } = event;

  try {
    verifyHasura(headers);
  } catch (error) {
    return JSON.parse(error.message);
  }

  const input: CreateOrderInput = JSON.parse(body!).input.order;

  const newOrder = await api.CreateOrder({
    client_address: input.client_address,
    client_name: input.client_name,
    client_phone: input.client_phone,
    comment: input.comment,
    payment_type: input.payment_type as Payment_Types_Enum,
  });

  const menuItems = input.items.split(',').map(orderItem => {
    const [menu_id, amount] = orderItem.split('_');

    return {
      order_id: newOrder.insert_orders_one.id,
      menu_id,
      amount,
    };
  });

  await api.AddItemsToOrder({
    objects: menuItems,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      id: newOrder.insert_orders_one.id,
    }),
  };
};

export { handler };
