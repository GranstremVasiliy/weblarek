import { ICustomer, PaymentType } from "../../types/index";
import { IEvents } from '../base/Events';


export class CustomerModel {
  public payment?: PaymentType
  public address: string = '';
  public email: string = '';
  public phone: string = '';

  constructor(private events: IEvents) {}

  setCustomer(data: Partial<ICustomer>): void {
    const model = this as ICustomer;

    for (const key in data) {
        const field = key as keyof ICustomer;
        const incomingValue = data[field];
        if (incomingValue !== undefined) {
            if (field === 'payment') {
                model[field] = incomingValue as PaymentType; 
            } else {
                model[field] = incomingValue as string;
            }
            this.events.emit('customer:updated', { field: field });
        }
    }
  }

  getCustomer(): ICustomer {
    return {
      payment: this.payment,
      address: this.address,
      email: this.email,
      phone: this.phone,
    };
  }
    clear(): void {
    this.payment = undefined;
    this.address = '';
    this.email = '';
    this.phone = '';
    this.events.emit('customer:updated', {});
  }

  validate(): { [K in keyof ICustomer]?: string } {
    const errors: { [K in keyof ICustomer]?: string } = {};
    if (!this.payment) errors.payment = 'Не выбран вид оплаты';
    if (!this.address.trim()) errors.address = 'Укажите адрес';
    if (!this.email.trim()) errors.email = 'Укажите емэйл';
    if (!this.phone.trim()) errors.phone = 'Укажите телефон';
    return errors; // Возвращаем полный объект ошибок
  }
}