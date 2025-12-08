import './scss/styles.scss';
import { CDN_URL } from './utils/constants.js';
import { cloneTemplate, ensureElement} from './utils/utils.js';
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
const basketView = new Basket (events, cloneTemplate('#basket'));
const cardPreviewView = new CardPreview(events, cloneTemplate('#card-preview'));


const orderFormView = new OrderForm(events, cloneTemplate('#order'));
const contactsFormView = new ContactsForm(events, cloneTemplate('#contacts'));
const orderSuccessView = new OrderSuccess(events, cloneTemplate('#success'));


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
        const card = new CardCatalog(events, cardContainer, item.id);
        return card.render({
            ...item,
            image: CDN_URL + item.image
        });
    });
    catalogView.render({ items: cardElements });
});

events.on('card:select', (data:{id:string}) => {
  const item = catalogModel.getItemById(data.id);
  if (item) {
    catalogModel.setSelectedItem(item);
  }
})

events.on('catalog:item-selected', (item:IProduct) => {
  
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
  modalView.content = cardPreviewView.render()
  modalView.open();
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
    if (modalView.isOpen && modalView.content === cardPreviewView.render()) {
      const selectedItem = catalogModel.getSelectedItem();
      if (selectedItem && selectedItem.price !== null) {
        const isInCart = cartModel.hasItem(selectedItem.id);
        cardPreviewView.updateBuyButton(isInCart, selectedItem.price);
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
});

events.on('modal:close', () => {
  modalView.close();
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
  modalView.content = orderFormView.render();
  modalView.open();
  
  const customerData = customerModel.getCustomer();
  const allErrors = customerModel.validate();

  orderFormView.render({
    payment:customerData.payment,
    address:customerData.address
  })
  
  const orderFormErrors:Record<string, string> = {};
  if (allErrors.payment) orderFormErrors.payment = allErrors.payment;
  if (allErrors.address) orderFormErrors.address = allErrors.address;
  orderFormView.showErrors(orderFormErrors);
  const isValid = !allErrors.payment && !allErrors.address;
  orderFormView.setSubmitEnabled(isValid);
})

events.on('form:change', (data:FormChangePayload) =>{
  customerModel.setCustomer({[data.field]:data.value});
});

events.on('form:order-submit', () => {
  const customerData = customerModel.getCustomer();
  const allErrors = customerModel.validate();

  const isOrderValid = !allErrors.payment && !allErrors.address;

    if (!isOrderValid) return;
    
    modalView.content = contactsFormView.render({
        email: customerData.email,
        phone: customerData.phone
    });
    modalView.open();

    const contactsFormErrors: Record<string, string> = {};
    if (allErrors.phone) contactsFormErrors.phone = allErrors.phone;
    if (allErrors.email) contactsFormErrors.email = allErrors.email
    contactsFormView.showErrors(contactsFormErrors)
    
    
    const isValid = !allErrors.phone && !allErrors.email;
    contactsFormView.setSubmitEnabled(isValid);
})

events.on('customer:updated', (data:CustomerUpdatePayload) => {
  const {field} = data;
  const customerData = customerModel.getCustomer();
  const allErrors = customerModel.validate();
 // OrderForm
  const orderFields: (keyof ICustomer)[] = ['payment', 'address'];
  if (!field || orderFields.includes(field)) {
      const isValid = !allErrors.payment && !allErrors.address;
      orderFormView.render({
          payment: customerData.payment,
          address: customerData.address
      });
      orderFormView.setSubmitEnabled(isValid);
      
      const formErrors: Record<string, string> = {};
      if (allErrors.payment) formErrors.payment = allErrors.payment;
      if (allErrors.address) formErrors.address = allErrors.address;
      orderFormView.showErrors(formErrors);
  }

  // ContactsForm
  const contactsFields: (keyof ICustomer)[] = ['email', 'phone'];
  if (!field || contactsFields.includes(field)) {
      const isValid = !allErrors.email && !allErrors.phone;
      contactsFormView.render({
          email: customerData.email,
          phone: customerData.phone
      });
      
      contactsFormView.setSubmitEnabled(isValid);
      
      const formErrors: Record<string, string> = {};
      if (allErrors.email) formErrors.email = allErrors.email;
      if (allErrors.phone) formErrors.phone = allErrors.phone;
      contactsFormView.showErrors(formErrors);
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

        orderSuccessView.render({
          amount: finalOrderData.total
      })

      modalView.content = orderSuccessView.render();
      modalView.open();
    })
    .catch(err => {
      console.error('Ошибка при оформлении заказа:', err);
    });
});

events.on('orderSuccess:close', () => {
  modalView.close();
})