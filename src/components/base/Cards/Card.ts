  import { Component } from "../Component"; 
  import { ensureElement } from "../../../utils/utils";
  import { IEvents } from "../Events";
  import { setElementData } from "../../../utils/utils";

  export interface ICard {
    title: string;
    price?: number | null;
    idValue: string
  }

  export abstract class Card extends Component<ICard> {
    protected titleElement: HTMLElement; 
    protected priceElement: HTMLElement;
    protected id:string
    
    constructor(protected events: IEvents, container: HTMLElement) {
      super(container);

      this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
      this.priceElement = ensureElement<HTMLElement>('.card__price', this.container);
      this.id ='';
    }

      set title(value: string) {
        this.titleElement.textContent = value;
      }

      set price(value: number | null | undefined) {
        if(value===null || value===undefined){
        this.priceElement.textContent = 'Беcценно';
      } else {
        this.priceElement.textContent = `${value} синапсов`;
      }}

      set idValue(value: string) {
      setElementData(this.container, { id: value });
      this.id = value;
      }

      get idValue():string {
        return this.id
      }

      render(data?: Partial<ICard> | undefined): HTMLElement {
        super.render(data);
        return this.container
      }
    }