import {Card, ICard} from "./Card";
import {IEvents} from "../../base/Events"
import {ensureElement} from "../../../utils/utils";

export interface ICardBasket extends ICard {
  cardIndex: number;
}

export class CardBasket extends Card {
  protected removeButton: HTMLButtonElement;
  protected cardIndexElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement, id: string) {
    super(events, container);
    this.idValue = id;
    this.removeButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);
    this.cardIndexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
    this.removeButton.addEventListener('click', (event: MouseEvent) => {
      event.stopPropagation();
      events.emit('card:remove', {id: this.container.dataset.id});
    });
  }

  set cardIndex(value: number) {
    this.cardIndexElement.textContent = `#${value}`;
  }

  render(data?: Partial<ICardBasket> ): HTMLElement {
      super.render(data);
      return this.container;
    } 
  } 
