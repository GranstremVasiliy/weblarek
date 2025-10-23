export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface IProduct {
  id: string; // Уникальный идентификатор товара
  title: string;  // Название товара
  image: string;  // Ссылка на изображение товара
  category: string;   // Категория, к которой относится товар
  price: number|null; // Цена товара (null — если товар не продаётся)
  description: string    // Подробное описание товара
}

export interface ICustomer {
  payment: 'card' | 'cash';   // Способ оплаты: банковская карта или наличные
  address: string;            // Адрес доставки заказа
  email: string;              // Электронная почта покупателя
  phone: string            // Контактный номер телефона покупателя
}

export interface IOrderRequest extends ICustomer {
  items: string[];  // Массив идентификаторов товаров, включённых в заказ
  total: number;   // Общая сумма заказа
}
export interface IOrderResponse {
  id: string;       // Уникальный идентификатор заказа
  total: number ;   // Общая сумма заказа
  items: string[];  // Массив идентификаторов товаров, включённых в заказ
}