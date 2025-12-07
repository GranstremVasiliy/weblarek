import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

export interface ICatalog {
  items: HTMLElement[];
}

export class Catalog extends Component<ICatalog> {
  protected catalogContainer: HTMLElement;
  

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.catalogContainer = this.container;
    }

  set items(value: HTMLElement[]) {
    this.catalogContainer.replaceChildren(...value);
  }

  render(data: Partial<ICatalog>): HTMLElement {
    super.render(data);
    return this.container;
  }
}
