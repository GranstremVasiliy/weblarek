import { IApi, IProduct, IOrderRequest, IOrderResponse } from '../../types/index.js';

export class Communication {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
}

getProducts(): Promise<{ items: IProduct[]; total: number }> {
  return this.api.get<{ items: IProduct[]; total: number }>('/product');
}

postOrder(order: IOrderRequest): Promise<IOrderResponse> {
  return this.api.post<IOrderResponse>('/order', order, 'POST');
};
}
