import { Component } from "./Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "./Events";

export interface IOrderSuccess {
  amount: number;
}

export class OrderSuccess extends Component<IOrderSuccess> {
  protected closeButton: HTMLButtonElement;
  protected description: HTMLElement;
  protected events: IEvents

  constructor(events: IEvents, container: HTMLElement) {
    super(container);

    this.events = events;
    this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
    this.description = ensureElement<HTMLElement>('.order-success__description', this.container);

    this.closeButton.addEventListener('click', () => {
      events.emit('orderSuccess:close');
    });
  }
  
  set amount(value: number) {
    this.description.textContent = `Списано ${value} синапсов`;
  }

  override render(data?: Partial<IOrderSuccess>): HTMLElement {
    return super.render(data);
  }
}