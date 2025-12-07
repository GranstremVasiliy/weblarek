import { Component } from "../Component";
import { ensureElement } from "../../../utils/utils";
import { IEvents } from "../Events";

export abstract class Form<T> extends Component<T> {
  protected errorContainer: HTMLElement;
  protected submitButton: HTMLButtonElement;
  protected events: IEvents;

  constructor(container: HTMLElement, events: IEvents)
   {
    super(container);
    this.events = events;
    this.errorContainer = ensureElement<HTMLElement>('.form__errors', this.container);
    this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
    

    this.container.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const field = target.name as keyof T;
      const value = target.value;
      this.events.emit('form:change', {field, value})
    })
    }


clearErors(): void {
  if (this.errorContainer){
  this.errorContainer.textContent = '';
  }
}

showErrors(errors:{ [key: string]: string }): void {
  const errorMessages = Object.values(errors).join(', ');
  if (this.errorContainer) {
    this.errorContainer.textContent = errorMessages;
  }
}

setSubmitEnabled(enabled: boolean): void {
  this.submitButton.disabled = !enabled;
} 

protected abstract bindHandlers(): void;

override  render(data?:Partial<T>): HTMLElement {
  return super.render(data);
}

}

