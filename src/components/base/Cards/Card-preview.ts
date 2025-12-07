import { Card, ICard } from "./Card";
import { ensureElement} from "../../../utils/utils";
import { IEvents } from "../Events";
import { categoryMap } from "../../../utils/constants";

export interface ICardPreview extends ICard {
  image: string;
  category: string;
  description: string;
  price?: number | null;
  id:string
}

export class CardPreview extends Card {
  protected imageElement: HTMLImageElement
  protected categoryElement: HTMLElement;
  protected descriptionElement: HTMLElement;
  protected cardButton: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(events, container);
    
    this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
    this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
    this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
    this.cardButton = ensureElement<HTMLButtonElement>('.card__button', this.container);

    this.cardButton.addEventListener('click', () => {
    if(this.cardButton.disabled) return;
      this.events.emit(`card:toggle`, {id:this.id})
    });
  }

  set image(src: string) {
    this.imageElement.src = src;
  }

  set category(value: string) { 
    this.categoryElement.textContent = value;
    const className = categoryMap[value as keyof typeof categoryMap] || '';
    this.categoryElement.className = `card__category ${className}`;
  } 

  set description(value: string) {
    this.descriptionElement.textContent = value;
  }
  
updateBuyButton(isInCart: boolean, price: number | null | undefined) {
  if (price === null || price === undefined) {
    this.cardButton.disabled = true;
    this.cardButton.textContent = 'Недоступно';
  } else {
    this.cardButton.disabled = false;
    const newText = isInCart ? 'Удалить из корзины' : 'Купить';
    this.cardButton.textContent= newText;
  }
}

  render(data?: Partial<ICardPreview>): HTMLElement {
    super.render(data);
    if (!data) return this.container;
    return this.container;
  }
  }
