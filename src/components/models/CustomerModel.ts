import { ICustomer } from "../../types/index";
import { IEvents } from '../base/Events';


export class CustomerModel {
  private payment: 'card' | 'cash'| null = null;
  private address: string = '';
  private email: string = '';
  private phone: string = '';

  constructor(private events: IEvents) {}

  setCustomer(data: Partial<ICustomer>): void {
    if (data.payment !== undefined) this.payment = data.payment;
    if (data.address !== undefined) this.address = data.address;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;

    this.events.emit('customer:updated', this.getCustomer());
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
    this.payment = null;
    this.address = '';
    this.email = '';
    this.phone = '';
  }
  validateOrder():void {
    const errors:{[K in 'payment' | 'address']?:string}={};
    if (!this.payment) {
      errors.payment = 'Не выбран вид оплаты';
    };
    if (!this.address.trim()) { 
      errors.address = 'Укажите адрес';
        }
    const isValid = Object.keys(errors).length === 0;
    this.events.emit('orderForm:validation-result', {
      isValid:isValid,
      errors:errors
    });
  }

  validateContacts(): void {
        const errors: { [K in 'email' | 'phone']?: string } = {};
        if (!this.email.trim()) {
            errors.email = 'Укажите емэйл';
        }
        if (!this.phone.trim()) { 
            errors.phone = 'Укажите телефон';
        }
        const isValid = Object.keys(errors).length === 0;
        this.events.emit('contactsForm:validation-result', { 
            isValid: isValid,
            errors: errors
        });
    }

  validate(): { [K in keyof ICustomer]?: string } {
      const errors: { [K in keyof ICustomer]?: string } = {};
      if (!this.payment) errors.payment = 'Не выбран вид оплаты';
      if (!this.address.trim()) errors.address = 'Укажите адрес';
      if (!this.email.trim()) errors.email = 'Укажите емэйл';
      if (!this.phone.trim()) errors.phone = 'Укажите телефон';
      return errors;
    }
}