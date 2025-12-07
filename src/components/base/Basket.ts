import { Component } from "./Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "./Events";



export interface IBasket {
  items?: HTMLElement[];
  total?: number;
  emptyText: string;
}   

export class Basket extends Component<IBasket> {
  protected list: HTMLElement;
  protected totalPrice: HTMLElement;
  protected basketButton: HTMLButtonElement;
  protected events: IEvents

  constructor( events: IEvents, container: HTMLElement) {
    super(container);
    this.events = events;
    this.list = ensureElement<HTMLElement>('.basket__list', this.container);
    this.totalPrice = ensureElement<HTMLElement>('.basket__price', this.container);
    this.basketButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);

    this.basketButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.events.emit('basket:submit');
    });
    this.setDisabled(this.basketButton, true);
  }

set items(elements: HTMLElement[]) {
  if (elements.length) {
    this.list.replaceChildren(...elements);
    this.setDisabled(this.basketButton, false);
  } else {
    this.list.innerHTML = `<div class="basket__empty">Корзина пуста</div>`;
    const isDisabled = elements.length === 0;
    this.setDisabled(this.basketButton, isDisabled);
  }} 

set total(value: number) {
    this.totalPrice.textContent = `${value} синапсов`;
  }

setDisabled(element: HTMLElement, state: boolean) {
  if (state) {
    element.setAttribute('disabled', 'disabled');
  } else {
    element.removeAttribute('disabled')
  }
}

  render(data: Partial<IBasket>={}): HTMLElement {
    super.render(data)
    return this.container;
}}
