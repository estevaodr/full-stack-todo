import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToDoComponent } from './to-do';
import { ITodo } from '@full-stack-todo/shared/domain';

/**
 * Helper function to create fake todo items for testing
 * 
 * This utility function creates a fake todo item with random data.
 * Instead of manually creating todo objects in every test, we use this helper.
 * It makes tests easier to read and maintain.
 * 
 * @returns {ITodo} A mock todo item with random data
 */
function createMockTodo(): ITodo {
  return {
    id: `todo-${Math.random().toString(36).substr(2, 9)}`,
    title: `Test Todo ${Math.random().toString(36).substr(2, 5)}`,
    description: `Test Description ${Math.random().toString(36).substr(2, 5)}`,
    completed: false,
  };
}

describe('ToDoComponent', () => {
  let component: ToDoComponent;
  let fixture: ComponentFixture<ToDoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // this usually mirrors the imports/providers declared on the component itself
      imports: [
        ToDoComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToDoComponent);
    
    // define a global reference to the component itself
    component = fixture.componentInstance;
    
    // tell the change detection system to "process" our newly-instantiated component
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test: Should successfully toggle completion
   * 
   * Our Angular application does/will heavily utilize RxJs Observables, so handling 
   * async code looks a little different than our API's Promise-based code. 
   * This test monitors the `ToDoComponent` EventEmitter via a subscription.
   */
  it('should successfully toggle completion', (done) => {
    const todo = createMockTodo();

    // `toggleComplete` is the EventEmitter that parent components will
    // bind to in a template. Our goal is to monitor the output 
    // of this EventEmitter and examine what happens when a user updates
    // the todo
    //
    // this subscription may be initiated here, but `toggleComplete` has not
    // emitted any data yet. this subscription lies "dormant" until 
    // _something_ is emitted later in the test
    component.toggleComplete.subscribe((data) => {
      expect(data).toStrictEqual(todo);
      // when the subscription does receive data, after we've 
      // validated the output, call the test's callback to 
      // finalize the test and move on
      done();
    });

    // assign the component's `Input()` property to the
    // fake todo
    component.todo = todo;
    
    // trigger change detection to ensure the component processes the input
    fixture.detectChanges();
    
    // call the same method tied to a button press in the template
    // 
    // this will trigger the EventEmitter which is detected and
    // processed a few lines above
    component.triggerToggleComplete();
  });

  /**
   * Test: Should emit editTodo event when edit is triggered
   */
  it('should emit editTodo event when edit is triggered', (done) => {
    const todo = createMockTodo();

    // Monitor the editTodo EventEmitter
    component.editTodo.subscribe((data) => {
      expect(data).toStrictEqual(todo);
      done();
    });

    // Set up the component with a todo
    component.todo = todo;
    fixture.detectChanges();
    
    // Trigger the edit action
    component.triggerEdit();
  });

  /**
   * Test: Should emit deleteTodo event when delete is triggered
   */
  it('should emit deleteTodo event when delete is triggered', (done) => {
    const todo = createMockTodo();

    // Monitor the deleteTodo EventEmitter
    component.deleteTodo.subscribe((data) => {
      expect(data).toStrictEqual(todo);
      done();
    });

    // Set up the component with a todo
    component.todo = todo;
    fixture.detectChanges();
    
    // Trigger the delete action
    component.triggerDelete();
  });

  /**
   * Test: Should not emit events when todo is undefined
   */
  it('should not emit events when todo is undefined', () => {
    let toggleEmitted = false;
    let editEmitted = false;
    let deleteEmitted = false;

    component.toggleComplete.subscribe(() => {
      toggleEmitted = true;
    });

    component.editTodo.subscribe(() => {
      editEmitted = true;
    });

    component.deleteTodo.subscribe(() => {
      deleteEmitted = true;
    });

    // Set todo to undefined
    component.todo = undefined;
    fixture.detectChanges();

    // Try to trigger actions
    component.triggerToggleComplete();
    component.triggerEdit();
    component.triggerDelete();

    // Since todo is undefined, the methods check for todo existence
    // and should not emit events
    expect(toggleEmitted).toBe(false);
    expect(editEmitted).toBe(false);
    expect(deleteEmitted).toBe(false);
  });
});
