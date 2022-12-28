import { faker } from '@faker-js/faker';
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { DateTime } from 'luxon';
import { api } from '../common/api';
import { CreateFackeOrderMutationVariables } from '../common/sdk';
import { verifyHasura } from '../common/verifyHasura';
import { config } from '../core/config';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { headers, queryStringParameters } = event;

  const {
    amount: amountRaw = '1',
    recent: recentRaw = '0',
    forceCreate: forceCreateRow = 'false',
  } = queryStringParameters;
  const amount = Number(amountRaw);
  const recent = Number(recentRaw);
  const forceCreate = forceCreateRow === "true";

  try {
    verifyHasura(headers);
  } catch (error) {
    return JSON.parse(error.message);
  }

  const currentHour = DateTime.now().setZone('Europe/Kiev').hour;
  const isWorkingHours = currentHour >= 10 && currentHour <= 22;

  if (!isWorkingHours && !forceCreate) {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'not working hours' }),
    };
  }

  const categories = await api.GetCategories();

  const menuItems = await api.GetMenuItemsGroupByCategoryId({
    firstCategory: categories.categories[0].id,
    secondCategory: categories.categories[1].id,
  });

  const firstGroupLength = menuItems.firstGroup.length;
  const secondGroupLength = menuItems.secondGroup.length;

  for (let i = 0; i < amount; i++) {
    const fakeData: CreateFackeOrderMutationVariables = {
      client_address: faker.address.streetAddress(true),
      client_name: faker.name.fullName(),
      client_phone: faker.phone.number('+3809########'),
      created_at: new Date(),
    };

    if (recent !== 0) {
      fakeData.created_at = faker.date.recent(recent);
    }

    const newOrder = await api.CreateFackeOrder(fakeData, {
      'x-hasura-admin-secret': config.hasuraAdminSecret,
    });

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
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'OK' }),
  };
};

export { handler };
