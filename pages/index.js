import React, { useState, useEffect } from "react";
import { MdDelete, MdEdit, MdConfirmationNumber } from "react-icons/md";
import axios from "axios";
import { format } from "date-fns";

import CheckBox from "../Components/CheckBox";

const Index = () => {
    const [editText, setEditText] = useState("");
    const [todos, setTodos] = useState([]);
    const [todosCopy, setTodosCopy] = useState(todos);
    const [todoInput, setTodoInput] = useState("");
    const [editIndex, setEditIndex] = useState(-1);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    // State management
    const [count, setCount] = useState(0);
    const [search, setSearch] = useState("");
    const [searchItem, setSearchItem] = useState(search);

    useEffect(() => {
        fetchTodos();
    }, [count]);

    const editTodo = (index) => {
        setTodoInput(todos[index].title);
        setEditIndex(index);
    };

    const fetchTodos = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8080/todos");
            setTodos(response.data);
            setTodosCopy(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const addTodo = async () => {
        try {
            if (editIndex === -1) {
                const response = await axios.post("http://127.0.0.1:8080/todos", {
                    title: todoInput,
                    completed: false,
                });
                console.log(response);
                setTodos(response.data);
                setTodosCopy(response.data);
                setTodoInput("");
            } else {
                // Update existing todo
                const todoToUpdate = { ...todos[editIndex], title: todoInput };
                const response = await axios.put(
                    `http://127.0.0.1:8080/todos/${todoToUpdate.id}`,
                    todoToUpdate
                );
                const updatedTodos = [...todos];
                updatedTodos[editIndex] = response.data;
                setTodos(updatedTodos);
                setTodoInput("");
                setEditIndex(-1);
                setCount(count + 1);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8080/todos/${id}`);
            setTodos(todos.filter((todo) => todo.id !== id));
        } catch (error) {
            console.log(error);
        }
    };

    const toggleCompleted = async (index) => {
        try {
            const todoToUpdate = {
                ...todos[index],
                completed: !todos[index].completed,
            };
            const response = await axios.put(
                `http://127.0.0.1:8080/todos/${todoToUpdate.id}`,
                todoToUpdate
            );
            const updatedTodos = [...todos];
            updatedTodos[index] = response.data;
            setTodos(updatedTodos);
            setCount(count + 1);
        } catch (error) {
            console.log(error);
        }
    };

    const searchTodo = () => {
        const results = todos.filter((todo) =>
            todo.title.toLowerCase().includes(searchInput.toLowerCase())
        );
        setSearchResults(results);
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime())
                ? "Invalid Date"
                : format(date, "dd-MM-yyyy HH:mm:ss");
        } catch (error) {
            console.log(error);
        }
    };

    const renderTodos = (todosToRender) => {
        return todosToRender.map((todo, index) => (
            <li key={index} className="li">
                <CheckBox toggleCompleted={toggleCompleted} index={index} todo={todo}/>
                <label htmlFor="" className="form-check-label"></label>
                <span className="todo-text">
                    {`${todo.title} - ${formatDate(todo.created_at)}`}
                </span>
                <span className="span-button" onClick={() => deleteTodo(todo.id)}>
                    <MdDelete />
                </span>
                <span className="span-button" onClick={() => editTodo(index)}>
                    <MdEdit />
                </span>
            </li>
        ));
    };

    const onHandleSearch = (value) => {
        const filteredTodo = todosCopy.filter(({ title }) =>
            title.toLowerCase().includes(value.toLowerCase())
        );
        if (filteredTodo.length === 0) {
            setTodos(todosCopy);
        } else {
            setTodos(filteredTodo);
        }
    };

    const onClearSearch = () => {
        if (todos.length && todosCopy.length) {
            setTodos(todosCopy);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchItem), 1000);
        return () => clearTimeout(timer);
    }, [searchItem]);

    useEffect(() => {
        if (search) {
            onHandleSearch(search);
        } else {
            onClearSearch();
        }
    }, [search]);

    return (
        <div className="main-body">
            <div className="todo-app">
                <div className="input-section">
                    <input
                        type="text"
                        id="todo"
                        placeholder="Add Task..."
                        value={todoInput}
                        onChange={(e) => setTodoInput(e.target.value)}
                    />
                    <button onClick={addTodo}>
                        {editIndex === -1 ? "Add" : "Update"}
                    </button>
                    <input
                        type="text"
                        id="search-input"
                        placeholder="Search"
                        value={searchItem}
                        onChange={(e) => setSearchItem(e.target.value)}
                    />
                    <button onClick={searchTodo}>Search</button>
                </div>
                <div className="todos">
                    <ul className="todo-list">{renderTodos(todos)}</ul>
                    {todos.length === 0 && (
                        <div>
                            <img className="face" src="/minimal-logo.webp" alt="" />
                            <h1 className="not-found">NOT FOUND</h1>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Index;

