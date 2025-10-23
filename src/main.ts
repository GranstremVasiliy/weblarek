import './scss/styles.scss';
import { Products } from './components/models/CatalogModel.js';
import { Cart } from './components/models/CartModel.js';
import { apiProducts } from './utils/data.js';
import { Customer } from './components/models/CustomerModel.js';
import { Communication } from './components/models/CommunicationModel.js';
import { api } from './components/base/Api.js';


const products = new Products();
products.setItems(apiProducts.items);
console.log("Массив товаров из каталога: ", products.getItems());
products.setSelectedItem(apiProducts.items[1]);
const selectedItem = products.getSelectedItem();
console.log("Выбранный товар: ", selectedItem);
console.log("Товар по ID: ", products.getItemById('c101ab44-ed99-4a54-990d-47aa2bb4e7d9'));

const cart = new Cart();
if (selectedItem) {
  cart.addItem(selectedItem);
}
cart.addItem(apiProducts.items[0]);
console.log("Товары в корзине: ", cart.getItems());
console.log("Общее количество товаров в корзине: ", cart.getCount());
console.log("Общая стоимость товаров в корзине: ", cart.getTotal());
console.log("Есть ли товар в корзине по ID 'c101ab44-ed99-4a54-990d-47aa2bb4e7d9': ", cart.hasItem('c101ab44-ed99-4a54-990d-47aa2bb4e7d9'));

cart.removeItem(apiProducts.items[1]);
console.log("Товары в корзине после удаления: ", cart.getItems());

cart.clear();
console.log("Товары в корзине после очистки: ", cart.getItems());

const customer = new Customer();
customer.setCustomer({ payment: 'cash' });
customer.setCustomer({ address: 'ул. Ленина, д. 10' });
customer.setCustomer({ email: 'test@example.com' });

console.log("Данные клиента: ", customer.getCustomer());
console.log("Ошибки валидации клиента: ", customer.validate());
customer.setCustomer({ phone: '+1234567890' });
console.log("Ошибки валидации клиента после добавления телефона: ", customer.validate());
customer.clear();
console.log("Данные клиента после очистки: ", customer.getCustomer());
 
const comm = new Communication(api); 
console.log("Делаем запрос на сервер..");

comm.getProducts()
  .then(response => { 
    products.setItems(response.items);
    console.log("Товары, полученные с сервера: ", products.getItems());
  })
  .catch(error => { 
    console.error("Ошибка при получении товаров с сервера: ", error);
  })

