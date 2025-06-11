/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';
import { Todo } from './types/Todo';
import { User } from './types/User';
import { getTodos, getUsers } from './api';

type StatusFilter = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  const visibleTodos = todos.filter(todo => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !todo.completed) ||
      (statusFilter === 'completed' && todo.completed);

    const matchesSearch = todo.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  useEffect(() => {
    setIsLoading(true);

    Promise.all([getTodos(), getUsers()])
      .then(([todosFromServer, usersFromServer]) => {
        setTodos(todosFromServer);
        setUsers(usersFromServer);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const selectedUser =
    users.find(user => user.id === selectedTodo?.userId) || null;

  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>

            <div className="block">
              {isLoading ? (
                <Loader />
              ) : (
                <TodoList
                  todos={visibleTodos}
                  onSelect={todo => {
                    setIsLoadingModal(true);

                    setTimeout(() => {
                      setSelectedTodo(todo);
                      setSelectedTodoId(todo.id);
                      setIsLoadingModal(false);
                    }, 500);
                  }}
                  selectedTodoId={selectedTodoId}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {isLoadingModal ? (
        <div className="modal is-active" data-cy="modal">
          <div className="modal-background" />
          <Loader />
        </div>
      ) : selectedTodo ? (
        <TodoModal
          selectedTodo={selectedTodo}
          onClose={() => {
            setSelectedTodo(null);
            setSelectedTodoId(null);
            setIsLoadingModal(false);
          }}
          user={selectedUser}
        />
      ) : null}
    </>
  );
};
