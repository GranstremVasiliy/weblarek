import { IProduct } from '../../types/index'
import { IEvents } from '../base/Events';

export class CatalogModel {
  private items: IProduct[] = [];
  private selectedItem: IProduct | null = null;

  constructor(private events: IEvents) {}
  
  getItems(): IProduct[] {
    return this.items;
  };
  setItems(items: IProduct[]): void {
    this.items = items;
    this.events.emit('catalog:changed', this.items);
  }

  setSelectedItem(item: IProduct): void {
    this.selectedItem = item;
    this.events.emit('catalog:item-selected', this.selectedItem);
  };
  getSelectedItem(): IProduct | null {
    return this.selectedItem;
  };
  getItemById(id: string): IProduct | undefined {
    return this.items.find(item => item.id === id);
  }
}