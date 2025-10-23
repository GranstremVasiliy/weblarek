import { IApi, IProduct, ICustomer, IOrderRequest, IOrderResponse } from '../../types/index.js';

export class Communication {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
}

getProducts(): Promise<{ items: IProduct[]; total: number }> {
  console.log("Выполняется запрос на получение товаров...");
  return this.api.get<{ items: IProduct[]; total: number }>('/product')
  .then(response => {   
    console.log("Ответ от сервера получен.");
    return response;
  })
  .catch((error) => {
    console.error("Ошибка при получении товаров: ", error);
    throw error;
  }); 
}

sendOrder(
  customerData: ICustomer,
  selectedItems: string[],
  total: number
): Promise<IOrderResponse> {
  const orderData: IOrderRequest = {
    ...customerData,
    items: selectedItems,
    total: total,
  };
  return this.api.post<IOrderResponse>('/order', orderData, 'POST');
}
}
