import { faker } from '@faker-js/faker';
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { api } from '../common/api';
import { verifyHasura } from '../common/verifyHasura';
import { config } from '../core/config';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const {headers} = event;

  try {
    verifyHasura(headers);
  } catch (error) {
    return JSON.parse(error.message);
  }

  const fakeData = {
    client_address: faker.address.streetAddress(true),
    client_name: faker.name.fullName(),
    client_phone: faker.phone.number('+3809########'),
  };

  const categories = await api.GetCategories();

  const menuItems = await api.GetMenuItemsGroupByCategoryId({
    firstCategory: categories.categories[0].id,
    secondCategory: categories.categories[1].id,
  });

  const newOrder = await api.CreateFackeOrder(fakeData, {
    'x-hasura-admin-secret': config.hasuraAdminSecret,
  });

  const firstGroupLength = menuItems.firstGroup.length;
  const secondGroupLength = menuItems.secondGroup.length;

  const firstGroupItem =
    menuItems.firstGroup[faker.datatype.number({ max: firstGroupLength - 1 })].id;
  const secondGroupItem =
    menuItems.secondGroup[faker.datatype.number({ max: secondGroupLength - 1 })].id;

  await api.AddItemsToFakeOrder(
    {
      objects: [
        { order_id: newOrder.insert_orders_one.id, menu_id: firstGroupItem },
        { order_id: newOrder.insert_orders_one.id, menu_id: secondGroupItem },
      ],
    },
    {
      'x-hasura-admin-secret': config.hasuraAdminSecret,
    }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({status: "OK"}),
  };
};

export { handler };
