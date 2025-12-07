import { Form } from "./Form";
import { ensureElement } from "../../../utils/utils";
import { IEvents } from "../Events";

export type PaymentType = 'card' | 'cash' | null;

export interface IOrderForm {
  payment: PaymentType
  address: string;
}

export class OrderForm extends Form<IOrderForm> {
  protected cardButton: HTMLButtonElement;
  protected cashButton: HTMLButtonElement;
  protected addressInput: HTMLInputElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container, events);
    
    this.cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
    this.cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
    this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
    this.bindHandlers();
  }

  protected bindHandlers(): void {
    this.cardButton.addEventListener('click', () => {
            this.events.emit('order:payment-change', { payment: 'card' });
        });
    this.cashButton.addEventListener('click', () => {
            this.events.emit('order:payment-change', { payment: 'cash' });
        });
    this.container.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        this.events.emit('form:order-submit')
      });
    }

  set payment(payment: PaymentType) {
    this.cardButton.classList.toggle('button_alt-active', payment === 'card');
    this.cashButton.classList.toggle('button_alt-active', payment === 'cash');
  }

  set address(address: string) {
    this.addressInput.value = address;
  } 
}
