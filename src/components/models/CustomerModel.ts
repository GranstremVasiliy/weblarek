import { ICustomer } from "../../types/index";

export class Customer {
  private payment: 'card' | 'cash' = 'card';
  private address: string = '';
  private email: string = '';
  private phone: string = '';

  setCustomer(data: Partial<ICustomer>): void {
    if (data.payment !== undefined) this.payment = data.payment;
    if (data.address !== undefined) this.address = data.address;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
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
    this.payment = 'card';
    this.address = '';
    this.email = '';
    this.phone = '';
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