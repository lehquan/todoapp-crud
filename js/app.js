
class Model {
	constructor() {
		// The state of the model, an array of todos objects
		// this.todos = [
		// 	{id: 1, text: 'Run a marathon', complete: false},
		// 	{id: 2, text: 'Plant a garden', complete: false},
		// ]
		
		this.todos = JSON.parse(localStorage.getItem('todos')) || []
	}
	
	bindTodoListChanged(callback) {
		this.onTodoListChanged = callback;
	}
	
	_commit(todos){
		this.onTodoListChanged(todos);
		localStorage.setItem('todos', JSON.stringify(todos));
	}
	
	addTodo(todoText) {
		const todo = {
			id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
			text: todoText,
			complete: false,
		};

		this.todos.push(todo);
		this._commit(this.todos);
	}
	
	// Map through all todos, and replace the text of the todo with the specified id
	editTodo(id, updatedText) {
		this.todos = this.todos.map(todo => todo.id === id ? {id: todo.id, text: updatedText, complete: todo.complete} : todo);
		this._commit(this.todos);
	}
	
	deleteTodo(id) {
		this.todos = this.todos.filter(todo => todo.id !== id);
		
		this._commit(this.todos)
	}
	
	// Flip the complete boolean on the specified todo
	toggleTodo(id) {
		this.todos = this.todos.map(todo =>
			todo.id === id ? { id: todo.id, text: todo.text, complete: !todo.complete } : todo
		);
		
		this._commit(this.todos);
	}

}

class View {
	constructor() {
		
		//root element
		this.app = this.getElement('#root');
		
		// title of app
		this.title = this.createElement('h1');
		this.title.textContent = 'Todos';
		
		// The form, with a [type="text"] input, and a submit button
		this.form = this.createElement('form');
		
		this.input = this.createElement('input');
		this.input.type = 'text';
		this.input.placeholder = 'Add todo';
		this.input.name = 'todo';
		
		// Submit button
		this.submitButton = this.createElement('button');
		this.submitButton.textContent = 'Submit';
		
		// the list of todo
		this.todoList = this.createElement('ul', 'todo-list');
		
		// append all child to form
		this.form.append(this.input, this.submitButton);
		
		// append all child to app
		this.app.append(this.title, this.form, this.todoList);
		
		this._temporaryTodoText = '';
		this._initLocalListeners();
	}
	
	get _todoText() {
		return this.input.value;
	}
	
	_resetInput() {
		this.input.value = '';
	}
	
	_initLocalListeners() {
		this.todoList.addEventListener('input', e => {
			if(e.target.className === 'editable') {
				this._temporaryTodoText = e.target.innerText;
			}
		})
	}
	
	createElement(tag, className) {
		const element = document.createElement(tag);
		if (className) element.classList.add(className);
		
		return element;
	}
	
	getElement(selector) {
		return document.querySelector(selector);
	}
	
	displayTodos(todos) {
		
		// Delete all nodes
		while(this.todoList.firstChild){
			this.todoList.removeChild(this.todoList.firstChild)
		}
		
		// Show default messages
		if(todos.length === 0) {
			const p = this.createElement('p');
			p.textContent = 'Nothing to do! Add a task?';
			
			this.todoList.append(p);
		}
		else {
			todos.forEach(todo => {
				const li = this.createElement('li');
				li.id = todo.id;
				
				const checkbox = this.createElement('input');
				checkbox.type = 'checkbox';
				checkbox.checked = todo.complete;
				
				const span = this.createElement('span');
				span.contentEditable = true;
				span.classList.add('editable');
				
				// If the todo is complete, it will have a strikethrough
				if (todo.complete) {
					const strike = this.createElement('s');
					strike.textContent = todo.text;
					span.append(strike)
				} else {
					// Otherwise just display the text
					span.textContent = todo.text
				}
				
				const deleteButton = this.createElement('button', 'delete');
				deleteButton.textContent = 'Delete';
				
				li.append(checkbox, span, deleteButton);
				
				this.todoList.append(li);
			});
		}
		
	}
	
	bindAddTodo(handler) {
		this.form.addEventListener('submit', e => {
			e.preventDefault();
			
			if (this._todoText) {
				handler(this._todoText);
				this._resetInput();
			}
		})
	}
	
	bindDeleteTodo(handler) {
		this.todoList.addEventListener('click', e => {
			
			if (e.target.className === 'delete') {
				const id = parseInt(e.target.parentElement.id);
				handler(id);
			}
		})
	}
	
	bindEditTodo(handler) {
		this.todoList.addEventListener('focusout', e => {
			if (this._temporaryTodoText) {
				const id = parseInt(e.target.parentElement.id);
				
				handler(id, this._temporaryTodoText);
				this._temporaryTodoText = '';
			}
		})
	}
	
	bindToggleTodo(handler) {
		this.form.addEventListener('change', e => {
			if(e.target.type === 'checkbox') {
				const id = parseInt(e.target.parentElement.id);
				handler(id);
			}
		})
	}
}

class Controller {
	constructor(model, view) {
		this.model = model;
		this.view = view;
		
		this.model.bindTodoListChanged(this.onTodoListChanged);
		this.view.bindAddTodo(this.handleAddTodo);
		this.view.bindEditTodo(this.handleEditTodo);
		this.view.bindDeleteTodo(this.handleDeleteTodo);
		this.view.bindToggleTodo(this.handleToggleTodo);
		
	}

	onTodoListChanged = todos => {
		this.view.displayTodos(todos);
	};

	handleAddTodo = todoText => {
		this.model.addTodo(todoText);
	};

	handleEditTodo = (id, todoText) => {
		this.model.editTodo(id, todoText);
	};
	
	handleDeleteTodo = id => {
		this.model.deleteTodo(id)
	};

	handleToggleTodo = id => {
		this.model.toggleTodo(id);
	}
}

const app = new Controller(new Model(), new View());
