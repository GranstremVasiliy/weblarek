import { IProduct } from '../../types/index'
export class Products {
  private items: IProduct[] = [];
  private selectedItem: IProduct | null = null;
  
  getItems(): IProduct[] {
    return this.items;
  };
  setItems(items: IProduct[]): void {
    this.items = items;
  };
  setSelectedItem(item: IProduct): void {
    this.selectedItem = item;
  };
  getSelectedItem(): IProduct | null {
    return this.selectedItem;
  };
  getItemById(id: string): IProduct | undefined {
    return this.items.find(item => item.id === id);
  }
}