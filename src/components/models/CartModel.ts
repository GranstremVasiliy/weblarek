  import { IProduct } from '../../types/index'

  export class Cart {
    private  items: IProduct[] = [];

    addItem(item: IProduct): void {
      this.items.push(item);
    }
    removeItem(item: IProduct): void {
      this.items = this.items.filter(i => i.id !== item.id);
    }
    getItems(): IProduct[] {
      return this.items;
    }
    getCount(): number {
      return this.items.length;
    }
    getTotal(): number {
      return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
    }
    hasItem(id: string): boolean {
      return this.items.some(item => item.id === id);
    }
    clear(): void {
      this.items = [];
    } 
  }
