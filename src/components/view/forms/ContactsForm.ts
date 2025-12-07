import { Form } from "./Form";
import { ensureElement } from "../../../utils/utils";
import { IEvents } from "../../base/Events";

export interface IContactsForm {
  email: string;
  phone: string;
}

export class ContactsForm extends Form<IContactsForm> {
  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container, events);

    this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
    this.bindHandlers();
  }

  protected bindHandlers(): void {
    this.container.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        this.events.emit('form:contacts-submit')
      });
  }

  set email(email: string){
    this.emailInput.value = email; 
  }

  set phone(phone: string) { 
    this.phoneInput.value = phone;
  }

override render(data?: Partial<IContactsForm>): HTMLElement{
  return super.render(data)
  }
}