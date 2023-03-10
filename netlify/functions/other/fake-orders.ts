import { faker } from '@faker-js/faker';
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { DateTime } from 'luxon';
import { api } from '../../common/api';
import { CreateFackeOrderMutationVariables, Payment_Types_Enum } from '../../common/sdk';
import { verifyHasura } from '../../common/verifyHasura';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { headers, queryStringParameters } = event;

  const {
    amount: amountRaw = '1',
    recent: recentRaw = '0',
    forceCreate: forceCreateRow = 'false',
    phone: phoneRaw = null,
  } = queryStringParameters;
  const amount = Number(amountRaw);
  const recent = Number(recentRaw);
  const forceCreate = forceCreateRow === 'true';
  const phone = phoneRaw ? decodeURIComponent(phoneRaw) : null;

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
      client_phone: phone ?? faker.phone.number('+3809########'),
      created_at: new Date(),
      comment: faker.datatype.boolean() ? faker.lorem.lines() : null,
      payment_type: faker.datatype.boolean() ? Payment_Types_Enum.Card : Payment_Types_Enum.Cash,
    };

    if (recent !== 0) {
      fakeData.created_at = faker.date.recent(recent);
    }

    const newOrder = await api.CreateFackeOrder(fakeData);

    const firstGroupItem =
      menuItems.firstGroup[faker.datatype.number({ max: firstGroupLength - 1 })].id;
    const secondGroupItem =
      menuItems.secondGroup[faker.datatype.number({ max: secondGroupLength - 1 })].id;

    const generateOrderItem = (menuid: string) => {
      return {
        order_id: newOrder.insert_orders_one.id,
        menu_id: menuid,
        amount: faker.datatype.boolean() ? 2 : 1,
      }
    }

    await api.AddItemsToOrder({
      objects: [
        generateOrderItem(firstGroupItem),
        generateOrderItem(secondGroupItem),
      ],
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'OK' }),
  };
};

export { handler };