"use client";

import { useEffect, useState } from "react";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (title: string) => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    fetchTasks();
  };

  const editTask = async (id: number, newTitle: string) => {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: newTitle }),
    });
    fetchTasks();
  };


  const toggleComplete = async (task: Task) => {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, completed: !task.completed }),
    });
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchTasks();
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">📝 Task Manager</h1>
      <TaskForm onAdd={addTask} />
      <TaskList
        tasks={tasks}
        onToggle={toggleComplete}
        onDelete={deleteTask}
        onEdit={editTask}
      />
    </div>
  );
}
