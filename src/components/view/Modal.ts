import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";

export interface IModal {
  content?: HTMLElement;
  open?: boolean;
}

export class Modal extends Component<IModal> {
  protected modalContainer: HTMLElement;
  protected modalContent: HTMLElement;
  protected closeButton: HTMLButtonElement;
  public isOpen: boolean = false;
  public currentContent: HTMLElement|null =null ;


  constructor (protected events: IEvents, container: HTMLElement){
    super(container);
    this.modalContainer = this.container;
    this.modalContent = ensureElement<HTMLElement>('.modal__content', this.container);
    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);


    this.closeButton.addEventListener('click', () => {
      this.events.emit('modal:close');
    }); 

    this.modalContainer.addEventListener('click', (event) => { 
      if(event.target instanceof Node && !this.modalContent.contains(event.target)){
        this.events.emit('modal:close');
      }
    });
  }
  
  public get content(): HTMLElement | null {
    return this.currentContent;
}


  public set content(element: HTMLElement | null) {
    if (element) {
        this.modalContent.replaceChildren(element); 
        this.currentContent = element;
    } else {
        this.modalContent.replaceChildren();
        this.currentContent = null;
    }
}

  open():void {
    this.modalContainer.classList.add('modal_active')
    this.isOpen = true;
  }

  close():void {
    this.modalContainer.classList.remove('modal_active');
    this.isOpen = false;
    this.content = null;
  } 

  render(data?: Partial<IModal> | undefined): HTMLElement {
    super.render(data);
    return this.container;
  }   
}
