  import { IProduct } from '../../types/index'
  import { IEvents } from '../base/Events';

  interface ICartChange {
    items: IProduct[];
    count: number;
    total: number;
    changedItemId?: string
  }


  export class CartModel {
    private  items: IProduct[] = [];

    constructor(private events: IEvents) {}

    addItem(item: IProduct): void {
      this.items.push(item);
      this.events.emit('cart:changed', {
        items: this.items,
        count: this.getCount(),
        total: this.getTotal(),
        changedItemId: item.id
      } as ICartChange); 
    }
    removeItem(item: IProduct): void {
      this.items = this.items.filter(i => i.id !== item.id);
      this.events.emit('cart:changed', {
        items: this.items,
        count: this.getCount(),
        total: this.getTotal(),
        changedItemId: item.id
      } as ICartChange);
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

    getItemById(id: string): IProduct | undefined {
    return this.items.find(item => item.id === id);
  }
    
    clear(): void {
      this.items = [];
      this.events.emit('cart:changed', {
        items: this.items,
        count: this.getCount(),
        total: this.getTotal()
      } as ICartChange);
      
    }   
  }
