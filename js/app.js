/**
 * Локальное хранилище это массив.
 * Каждая запись которого состоит из следующих полей:
 * 1. {number} type        - код вида операции
 * 2. {number} id          - идентификатор операции;
 * 3. {string} description - описание операции;
 * 4. {number} value       - сумма операции.
 */

let storage = [];

// UI Elements
// Контейнер для вывода данных о доходах и расходах 
const container = document.querySelector(".container.clearfix");
// Таблица доходов
const tableIncomes = document.querySelector(".income__list");
// Таблица расходов
const tableExpenses = document.querySelector(".expenses__list");
// Поле для ввода описания операции
const inputDesc = document.querySelector(".add__description");
// Поле для ввода суммы дохода/расхода
const inputValue = document.querySelector(".add__value");
// Кнопка "Добавить" 
const btnAdd = document.querySelector(".add__btn");
// Комбобокс для выбора вида операции (доход/расход)
const select = document.querySelector(".add__type");
// Виды операций
const types = Array.from(select.options).map((item) => item.value);

// Events
// Обработка события: изменение вида операции (доход/расход) 
select.addEventListener("change", (e) => {
	let cls = "red-focus";
	select.classList.toggle(cls);
	inputDesc.classList.toggle(cls);
	inputValue.classList.toggle(cls);
	btnAdd.classList.toggle(cls);
	btnAdd.classList.toggle("red");
});

// Изменить аттрибут "disabled" элемента "btnAdd" в зависимости от 
// значений элементов "inputDesc" и "inputValue"
inputDesc.addEventListener("keyup", e => btnAddDisabled());
inputValue.addEventListener("keyup", e => btnAddDisabled());
inputValue.addEventListener("change", e => btnAddDisabled());

// Обработка события: нажатие на элемент "btnAdd" 
btnAdd.addEventListener("click", (e) => {
	// Добавление данных в локальное хранилище
	let data = addDataIntoStorage(types.indexOf(select.value), inputDesc.value, inputValue.value);
	
	// Вывод данных на веб-страницу
	addDataIntoHtml(data);

	// Вывод итогов на веб-страницу
	displayTotals();

	// Установить элементы управления в состояние "по-умолчанию"
	setInputsDefault();
});

// Обработка нажатий в контейнере с детальной информацией о доходах и расходах
container.addEventListener("click", (e) => {
	// Нажатие на кнопку "Удалить"
	if (e.target.classList.contains("item__delete--btn") || e.target.closest(".item__delete--btn")) {
		// Удаление данных
		deleteItem(e.target.closest(".item").id);

		// Вывод итогов на веб-страницу
		displayTotals();
	}
});

// Выполнить после полной загрузки DOM
document.addEventListener('DOMContentLoaded', function () {
	// Установить элементы управления в состояние "по-умолчанию"
	setInputsDefault();

	// Вывести дату
	const spanDate = document.querySelector(".budget__title--month");
	spanDate.innerHTML = new Date().toLocaleString("en-uS", {month: "long", year: "numeric"});

	// Обновить итоги на веб-странице
	displayTotals();  
});

// Functions
/**
 * setInputsDefault - функция устанавливает элементы управления в состояние "по-умолчанию"
 * @returns {void}
 */
const setInputsDefault = () => {
	inputDesc.value = "";
	inputValue.value = "";
	btnAdd.disabled = true;	
}

/**
 * btnAddDisabled - устанавливает значение аттрибута disabled для элемента btnAdd
 * @returns {void}
 */
const btnAddDisabled = () => btnAdd.disabled = !(inputDesc.value && inputValue.value);

/**
 * addDataIntoStorage - функция для добавления данных о доходе/расходе
 * @param {number} type - код вида операции: 0 - доход, 1 - расход
 * @param {string} description - описание операции
 * @param {number} value - сумма операции
 * @returns {object} - обьект с данными по операции
 */
const addDataIntoStorage = (type, description, value) => {
	if (isNaN(type) || type === null || type < 0) return console.log("Укажите тип операции.");
	if (!description) return console.log("Введите описание.");
	if (!value) return console.log("Введите сумму.");

	const data = {
		type,
		description, 
		value: + Math.abs(value).toFixed(2), 
		id: getNewId(storage, type)
	};

	storage.push(data);

	return data;
}

/**
 * getNewId - функция возвращает номер идентификатора для новой операции, согласно ее типу
 * @param {array} array - массив хранящий данные об оперциях
 * @param {number} type - код вида операции
 * @returns {number} - возвращает максимальное числовое значение поля id, для текущей операции, увеличенное на единицу
 */
const getNewId = (array, type) => array.reduce((id, item) => id = (item.type === type && item.id > id) ? item.id : id, -1) + 1;

/**
 * addDataIntoHtml - функция добавляет данные по операции на веб-страницу
 * @param {object} data - данные, которые необходимо отобразить на html странице
 * @returns {void}  
 */
const addDataIntoHtml = (data) => {
	const template = getDataTemplate(data);
	// Контейнер должен иметь класс:
	// 1. ".income__list"  - для отображения данных о доходах;
	// 2. ".expense__list" - для отображения данных о расходах;
	const container = document.querySelector("." + getTypeValue(data.type) + "__list");
	container.insertAdjacentHTML("beforeend", template);
}

/**
 * getDataTemplate - функция возвращает заполненый данными шаблон html разметки
 * @param {object} data - данные, которые необходимо перенести в шаблон
 * @returns {string} - возвращает заполненый данными шаблон html разметки 
 */
const getDataTemplate = (data) => {
	return `
		<div class="item clearfix" id="${getTypeValue(data.type) + '-' + data.id}">
			<div class="item__description">${data.description}</div>
			<div class="right clearfix">
				<div class="item__value">${getTypeValue(data.type) === 'income' ? '+ ' : '- '} ${data.value.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
				<div class="item__delete">
					<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
				</div>
			</div>
		</div>
	`;
}

/**
 * deleteItem - удаление данных о доходе/расходе
 * @param {sting} id - идентификатор удаляемых данных
 * @returns {void}
 */
const deleteItem = id => {
	// Проверки входящего параметра
	if (!id) return console.log("Передайте id удаляемой записи.");
	const check_id = storage.some(item => getTypeValue(item.type) + '-' + item.id === id);
	if (!check_id) return console.log("Передайте правильный id записи.");

	// Подтверждение действия
	if (!confirm("Удалить запись?")) return;

	// Удаление строки из хранилища
	storage = storage.filter(item => getTypeValue(item.type) + '-' + item.id !== id);

	// Удаление данных из разметки веб-страницы
	deleteDataFromHtml(id);
}

/**
 * deleteDataFromHtml - удаление данных из разметки веб-страницы
 * @param {string} id - уникальный идентификатор удаляемых данных
 * @returns {void}
 */
const deleteDataFromHtml = id => {
	const target = document.getElementById(id);
	const target_parent = target.parentElement;
	target_parent.removeChild(target);
}

/**
 * getValuesSum - функция считает сумму всех значений поля "value" данного массива, для указанного вида операций
 * @param {array} array - массив хранящий данные об оперциях
 * @param {number} type - код вида операции
 * @returns {number} - возвращает сумму всех значений поля "value", для указанного вида операций
 */
const getValuesSum = (array, type) => array.reduce((res, item) => res + (item.type === type ? item.value : 0), 0);

/**
 * displayTotals - функция выводит итоговые данные по операциям на веб-страницу
 * @returns {void}
 */
const displayTotals = () => {
	// Перенос результатов вычислений на веб-страницу
	// Сумма доходов (type === 0)
	let incSum = getValuesSum(storage, 0);
	document.querySelector(".budget__income--value").innerHTML = "+ " + incSum.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});

	// Сумма расходов (type === 1)
	let expSum = getValuesSum(storage, 1);
	document.querySelector(".budget__expenses--value").innerHTML = "- " + expSum.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});

	// Итого
	let total = incSum - expSum;
	document.querySelector(".budget__value").innerHTML = (total < 0 ? "- " : (total > 0 ? "+ " : "")) + Math.abs(total).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

/**
 * getTypeValue - функция определяет наименование вида операции, согласно её индекса в массиве видов операций
 * @param {number} index - индекс искомого элемента в массиве видов операций 
 * @returns {string} - возвращает наименование вида операции
 */
const getTypeValue = (index) => types[index] || '';