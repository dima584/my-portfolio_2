import { BehaviorSubject, fromEvent, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

type FilterType = 'all' | 'active' | 'completed';


const todos$ = new BehaviorSubject<Todo[]>([]);
// Початковий стан фільтра: показувати всі задачі
const filter$ = new BehaviorSubject<FilterType>('all');


const inputEl = document.getElementById('todo-input') as HTMLInputElement;
const addBtnEl = document.getElementById('add-btn') as HTMLButtonElement;
const listEl = document.getElementById('todo-list') as HTMLUListElement;
const filterBtns = document.querySelectorAll('.filter-btn');



fromEvent(addBtnEl, 'click')
  .pipe(
    map(() => inputEl.value.trim())
  )
  .subscribe((text) => {
    if (text) {
      const currentTodos = todos$.getValue();
      const newTodo: Todo = { id: Date.now(), text, completed: false };
      
      todos$.next([...currentTodos, newTodo]);
      inputEl.value = ''; // Очищаємо поле
    }
  });

fromEvent(listEl, 'click')
  .pipe(
    map((event) => event.target as HTMLElement)
  )
  .subscribe((target) => {
    const currentTodos = todos$.getValue();
    const id = Number(target.closest('li')?.dataset.id);

    if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
      const updatedTodos = currentTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      todos$.next(updatedTodos);
    }
    
    if (target.tagName === 'BUTTON' && target.classList.contains('delete-btn')) {
      const filteredTodos = currentTodos.filter(todo => todo.id !== id);
      todos$.next(filteredTodos);
    }
  });

filterBtns.forEach(btn => {
  fromEvent(btn, 'click')
    .pipe(
      map((event) => {
        const target = event.target as HTMLButtonElement;
        return target.dataset.filter as FilterType;
      })
    )
    .subscribe((filterValue) => {
      filter$.next(filterValue); // Оновлюємо стан фільтра
    });
});

combineLatest([todos$, filter$]).subscribe(([todos, currentFilter]) => {

  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true; // для 'all'
  });

  listEl.innerHTML = '';
  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.dataset.id = todo.id.toString();
    li.className = todo.completed ? 'completed' : '';
    
    li.innerHTML = `
      <label>
        <input type="checkbox" ${todo.completed ? 'checked' : ''} />
        ${todo.text}
      </label>
      <button class="delete-btn">Видалити</button>
    `;
    listEl.appendChild(li);
  });
});