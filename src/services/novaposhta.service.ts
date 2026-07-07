// services/novaposhta.service.ts
const NP_API = 'https://api.novaposhta.ua/v2.0/json/';
const NP_KEY = process.env.NOVA_POSHTA_API_KEY!;

// Search for cities by name
export const searchCities = async (query: string) => {
  const res = await fetch(NP_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: NP_KEY,
      modelName: 'Address',
      calledMethod: 'searchSettlements',
      methodProperties: {
        CityName: query,
        Limit: 5,
      },
    }),
  });

  const data = await res.json();
  return data.data[0]?.Addresses ?? [];
};

// Search for warehouses in a specific city
export const searchWarehouses = async (cityRef: string, query?: string) => {
  const res = await fetch(NP_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: NP_KEY,
      modelName: 'AddressGeneral',
      calledMethod: 'getWarehouses',
      methodProperties: {
        CityRef: cityRef,
        FindByString: query ?? '',
        Limit: 10,
      },
    }),
  });

  const data = await res.json();
  return data.data ?? [];
};

// Create a new order in Nova Poshta
export const createNovaPoshtaOrder = async (orderData: {
  recipientName: string;
  recipientPhone: string;
  cityRef: string;
  warehouseRef: string;
  weight: number;
  description: string;
  price: number;
}) => {
  const res = await fetch(NP_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: NP_KEY,
      modelName: 'InternetDocument',
      calledMethod: 'save',
      methodProperties: {
        PayerType: 'Recipient',      // одержувач платить за доставку
        PaymentMethod: 'Cash',
        CargoType: 'Parcel',
        Weight: orderData.weight,
        ServiceType: 'WarehouseWarehouse', // відділення → відділення
        SeatsAmount: 1,
        Description: orderData.description,
        Cost: orderData.price,       // оголошена вартість

        // Відправник — твої дані (заповнюєш один раз)
        CitySender: process.env.NP_SENDER_CITY_REF,
        Sender: process.env.NP_SENDER_REF,
        SenderAddress: process.env.NP_SENDER_WAREHOUSE_REF,
        ContactSender: process.env.NP_CONTACT_REF,
        SendersPhone: process.env.NP_SENDER_PHONE,

        // Одержувач — дані з замовлення
        CityRecipient: orderData.cityRef,
        RecipientAddress: orderData.warehouseRef,
        RecipientsPhone: orderData.recipientPhone,
        RecipientName: orderData.recipientName,
        RecipientType: 'PrivatePerson',
      },
    }),
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.errors?.join(', '));
  }

  return {
    trackingNumber: data.data[0].IntDocNumber, // ТТН номер
    ref: data.data[0].Ref,
  };
};