import { ICustomer } from "../types";
import { isEmpty } from "./utils";
import { OrderForm } from ".././components/view/forms/OrderForm";
import { ContactsForm } from ".././components/view/forms/ContactsForm"

type FormView = OrderForm | ContactsForm;

export const hasError = (value:string|undefined):value is string => !isEmpty(value);

// Функция принимает полный набор данных и все ошибки, но фильтрует их, оставляя только те, которые относятся к полям, перечисленным в массиве fields (например, только payment и address для OrderForm).

export const updateFormView = (
    formView: FormView,                                 // Экземпляр формы (View)
    customerData: ICustomer,                            // Полные данные из Модели
    allErrors: { [K in keyof ICustomer]?: string },     // Полный объект ошибок из Модели
    fields: (keyof ICustomer)[]                         // Поля, которые принадлежат этой форме
): void => {
    const formErrors: Record<string, string> = {};
    let isValid = true;
    // Шаг 1: Фильтрация ошибок
    fields.forEach(field => {
        const error = allErrors[field];
        if (hasError(error)) { 
            formErrors[field] = error;
            isValid = false; 
        }
    });
    // Шаг 2: Собираем только те данные, которые подходят для этой формы
    const viewData = fields.reduce((acc, field) => {
        (acc as any)[field] = customerData[field];
        return acc;
    }, {} as Partial<ICustomer>);
    // Шаг 3: Рендерим, управляем кнопкой и ошибками
    formView.render(viewData);
    formView.setSubmitEnabled(isValid);
    if (!isValid) {
        formView.showErrors(formErrors);
    } else {
        formView.clearErors();
    }
};