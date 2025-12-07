import './scss/styles.scss';
import { CDN_URL } from './utils/constants.js';
import { cloneTemplate, ensureElement} from './utils/utils.js';
import { CatalogModel } from './components/models/CatalogModel.js';
import { CartModel } from './components/models/CartModel.js';
import { CustomerModel } from './components/models/CustomerModel.js';

import { Communication } from './components/models/CommunicationModel.js';
import { api } from './components/base/Api.js';
import { EventEmitter } from './components/base/Events.js';

import { CardCatalog } from './components/base/Cards/Card-catalog.js';
import { CardPreview } from './components/base/Cards/Card-preview.js';
import { Catalog } from './components/base/Catalog.js';
import { Basket } from './components/base/Basket.js';
import { Header } from './components/base/Header.js';
import { Modal } from './components/base/Modal.js';
import { IProduct } from './types/index.js';
import { CardBasket } from './components/base/Cards/Card-basket.js';
import { OrderForm } from './components/base/Forms/OrderForm.js';
import { IOrderForm } from './components/base/Forms/OrderForm.js';
import { PaymentType } from './components/base/Forms/OrderForm.js';
import { ContactsForm } from './components/base/Forms/ContactsForm.js';
import { IContactsForm } from './components/base/Forms/ContactsForm.js';
import { OrderSuccess } from './components/base/OrderSuccess.js';


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

let openedCardPreview: CardPreview | null = null;
let orderFormView: OrderForm | null = null;
let contactsFormView: ContactsForm | null = null;

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
    const CardCatalogView = new CardCatalog(events, cardContainer, item.id)
    const itemRender = {
      ...item,
      image:  CDN_URL + item.image
    }
    return CardCatalogView.render(itemRender);
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
  modalView.open = true
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
        const CardBasketView = new CardBasket(events, cardContainer, item.id); 
        return CardBasketView.render({
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
  modalView.open = false;
  openedCardPreview = null;
})

events.on('cart:open', () => {
  modalView.content = basketView.render();
  modalView.open = true;
})

events.on('card:remove', (data:{id:string}) => {
  const removeItem = cartModel.getItemById(data.id);
  if (removeItem) {
    cartModel.removeItem(removeItem);
  }
})

events.on('basket:submit', () => {
  const orderContainer = cloneTemplate('#order');
  orderFormView = new OrderForm(events, orderContainer);
  const currentCustomer = customerModel.getCustomer();

  orderFormView.render({
    payment:currentCustomer.payment,
    address:currentCustomer.address
  });
modalView.open = true;
  modalView.content = orderFormView.returnContainer
  
  customerModel.validateOrder();
})

events.on('form:change', (data:{field: keyof (IOrderForm & IContactsForm), value:string}) =>{
  if (data.field === 'address') {
    customerModel.setCustomer({address:data.value});
    customerModel.validateOrder();
  }
  else if(data.field === 'email'|| data.field === 'phone'){
    customerModel.setCustomer({[data.field]:data.value});
    customerModel.validateContacts();
  }
});

events.on('order:payment-change', (data:{payment: PaymentType}) => {
  customerModel.setCustomer({payment:data.payment});
  if (orderFormView && orderFormView instanceof OrderForm) {
        const currentCustomerData = customerModel.getCustomer();
    orderFormView.render({
      payment:currentCustomerData.payment,
      address:currentCustomerData.address
    });
  }
  customerModel.validateOrder();
})

events.on('orderForm:validation-result', (data:{ isValid:boolean, errors:{[key:string]:string}}) => {
  if(orderFormView && orderFormView instanceof OrderForm) {
    orderFormView.setSubmitEnabled(data.isValid)
  };
  if(data.isValid) {
    orderFormView?.clearErors();
  } else {
    orderFormView?.showErrors(data.errors)
  }
  
})

events.on('form:order-submit', () => {
const ContactsContainer = cloneTemplate('#contacts');
  contactsFormView = new ContactsForm(events, ContactsContainer);
  const currentCustomer = customerModel.getCustomer();

  contactsFormView.render({
    email:currentCustomer.email,
    phone:currentCustomer.phone
  });
  modalView.content = contactsFormView.returnContainer;
  modalView.open = true;
  
  customerModel.validateContacts();
})

events.on('contactsForm:validation-result', (data:{ isValid:boolean, errors:{[key:string]:string}}) => {
  if(contactsFormView && contactsFormView instanceof ContactsForm) {
    contactsFormView.setSubmitEnabled(data.isValid)
  };
  if(data.isValid) {
   contactsFormView?.clearErors();
  } else {
    contactsFormView?.showErrors(data.errors)
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
      modalView.open = true;
    })
    .catch(err => {
      console.error('Ошибка при оформлении заказа:', err);
    });
});

events.on('orderSuccess:close', () => {
  modalView.open = false;
})