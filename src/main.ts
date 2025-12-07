import './scss/styles.scss';
import { CDN_URL } from './utils/constants.js';
import { cloneTemplate, ensureElement} from './utils/utils.js';
import { updateFormView } from './utils/formUtil.js';
import { FormChangePayload, CustomerUpdatePayload } from './types/index.js'

import { CatalogModel } from './components/models/CatalogModel.js';
import { CartModel } from './components/models/CartModel.js';
import { CustomerModel } from './components/models/CustomerModel.js';

import { Communication } from './components/models/CommunicationModel.js';
import { api } from './components/base/Api.js';
import { EventEmitter } from './components/base/Events.js';

import { CardCatalog } from './components/view/cards/Card-catalog.js';
import { CardPreview } from './components/view/cards/Card-preview.js'
import { Catalog } from './components/view/Catalog.js';
import { Basket } from './components/view/Basket.js'
import { Header } from './components/view/Header.js'
import { Modal } from './components/view/Modal.js'
import { ICustomer, IProduct } from './types/index.js';
import { CardBasket } from './components/view/cards/Card-basket.js'
import { OrderForm } from './components/view/forms/OrderForm.js'
import { ContactsForm } from './components/view/forms/ContactsForm.js'
import { OrderSuccess } from './components/view/OrderSuccess.js'

const events = new EventEmitter();
const comm = new Communication(api);
const catalogContainer = ensureElement<HTMLElement>('.gallery');
const catalogModel = new CatalogModel(events);
const cartModel = new CartModel(events);
const customerModel = new CustomerModel(events);


const catalogView  = new Catalog(events, catalogContainer);
const modalView = new Modal (events, ensureElement('.modal'));
const headerView = new Header (events, ensureElement('.header'));
const basketView = new Basket (events, cloneTemplate('#basket'))


const orderFormView = new OrderForm(events, cloneTemplate('#order'));
const contactsFormView = new ContactsForm(events, cloneTemplate('#contacts'));
let openedCardPreview: CardPreview | null = null;

comm.getProducts()
  .then(response => {
    catalogModel.setItems(response.items);
  })
  .catch(error => {
    console.error('Ошибка при получении товаров с сервера:', error);
    catalogModel.setItems([]);
  });

events.on('catalog:changed', (items: IProduct[]) => {
  const cardElements = items.map(item => {
    const cardContainer = cloneTemplate('#card-catalog');
    const cardCatalogView = new CardCatalog(events, cardContainer, item.id)
    const itemRender = {
      ...item,
      image:  CDN_URL + item.image
    }
    return cardCatalogView.render(itemRender);
  });
  catalogView.render({items:cardElements});
})

events.on('card:select', (data:{id:string}) => {
  const item = catalogModel.getItemById(data.id);
  if (item) {
    catalogModel.setSelectedItem(item);
  }
})

events.on('catalog:item-selected', (item:IProduct) => {
  const cardContainer = cloneTemplate<HTMLTemplateElement>('#card-preview');
  const cardPreviewView = new CardPreview(events, cardContainer);
  openedCardPreview = cardPreviewView;
  const isInCart = cartModel.hasItem(item.id);
  cardPreviewView.render({
    id:item.id,
    title:item.title,
    description:item.description,
    category:item.category,
    price: item.price ?? null,
    image: CDN_URL+item.image
  })
  cardPreviewView.updateBuyButton(isInCart, item.price??null)
  modalView.content = cardPreviewView.render();
  modalView.open()
})

events.on('card:toggle', (data:{id:string}) => {
  const item  = catalogModel.getItemById(data.id);
  if (!item || item.price === null) return
  if(cartModel.hasItem(item.id)) {
    cartModel.removeItem(item);
  } else {
    cartModel.addItem(item);
  }
})

events.on('cart:changed', (data: {items:IProduct[], count:number, total:number, changedItemId:string}) => {
   headerView.setCounter(data.count);
   //PreviewCardView:
    if (modalView.isOpen && openedCardPreview) {
        if(data.changedItemId && openedCardPreview.idValue !== data.changedItemId) {
        } else {
            const selectedItem = catalogModel.getItemById(openedCardPreview.idValue);
            if (selectedItem && selectedItem.price !== null) {
                const isInCart = cartModel.hasItem(selectedItem.id);
                openedCardPreview.updateBuyButton(isInCart, selectedItem.price);
            }
        }
    }
  //BasketCardView:
    const basketItemsElements = data.items.map((item: IProduct, index) => {
        const cardContainer = cloneTemplate('#card-basket'); 
        const cardBasketView = new CardBasket(events, cardContainer, item.id); 
        return cardBasketView.render({
            title: item.title,
            price: item.price ?? null,
            cardIndex: index + 1
        });
    });
    basketView.render({
        items: basketItemsElements,
        total: data.total
    });
    if (modalView.isOpen) {
        if (basketView.returnContainer === modalView.content) { 
            modalView.content = basketView.render();
        }
    }
});

events.on('modal:close', () => {
  modalView.close();
  openedCardPreview = null;
})

events.on('cart:open', () => {
  modalView.content = basketView.render();
  modalView.open();
})

events.on('card:remove', (data:{id:string}) => {
  const removeItem = cartModel.getItemById(data.id);
  if (removeItem) {
    cartModel.removeItem(removeItem);
  }
})

events.on('basket:submit', () => {
  modalView.content = orderFormView.returnContainer;
  modalView.open();
  events.emit('customer:updated', {})
})

events.on('form:change', (data:FormChangePayload) =>{
  customerModel.setCustomer({[data.field]:data.value});
});

events.on('form:order-submit', () => {
  modalView.content = contactsFormView.returnContainer;
  modalView.open();
  events.emit('customer:updated', {})
})

events.on('customer:updated', (data:CustomerUpdatePayload) => {
  const {field} = data;
  const customerData = customerModel.getCustomer();
  const allErrors = customerModel.validate();

  const orderFields:(keyof ICustomer)[] = ['payment', 'address'];
  const contactsFields:(keyof ICustomer)[] = ['email','phone'];
  if(!field||orderFields.includes(field)) {
    updateFormView(orderFormView, customerData, allErrors, orderFields);
  }

  if(!field || contactsFields.includes(field)) {
        updateFormView(contactsFormView, customerData, allErrors, contactsFields)
      }
    })
  
  events.on('form:contacts-submit', () => {
    const orderData = customerModel.getCustomer();
    const items = cartModel.getItems().map(item => item.id);
    const total = cartModel.getTotal();

    const finalOrderData =  {
      payment: orderData.payment,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address,
      total: total,
      items: items
    }

    console.log('Отправка заказа:', finalOrderData);

    comm.postOrder(finalOrderData)
      .then(()=>{
        cartModel.clear();
        customerModel.clear();

        const successContainer = cloneTemplate('#success')
        const successView = new OrderSuccess(events, successContainer);

        successView.render({
          amount: finalOrderData.total
      })

      modalView.content = successView.returnContainer;
      modalView.open();
    })
    .catch(err => {
      console.error('Ошибка при оформлении заказа:', err);
    });
});

events.on('orderSuccess:close', () => {
  modalView.close();
})