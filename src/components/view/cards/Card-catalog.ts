import { ensureElement} from "../../../utils/utils";
import { IEvents } from "../../base/Events"
import { Card, ICard } from "./Card";
import { categoryMap } from "../../../utils/constants";


export interface ICardCatalog extends ICard {
  image: string;
  category: string;
  id: string;
}

export class CardCatalog extends Card {
  protected imageElement: HTMLImageElement;
  protected categoryElement: HTMLElement;

  
  constructor(protected events: IEvents, container: HTMLElement, id: string){
  
    super(events,container)
    this.idValue = id
    this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
    this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
    
    this.container.addEventListener('click', () => {
      this.events.emit('card:select', { id: this.id });
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

render(data?: Partial<ICardCatalog>): HTMLElement {
  super.render(data);
return this.container;
}  
} 
