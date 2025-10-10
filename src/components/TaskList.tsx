"use client";

import { useState } from "react";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface Props {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newTitle: string) => void;
}

export default function TaskList({ tasks, onToggle, onDelete, onEdit }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.title);
  };

  const saveEdit = (id: number) => {
    onEdit(id, editText);
    setEditingId(null);
    setEditText("");
  };

  return (
    <ul className="w-72">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex justify-between items-center mb-2 border-b pb-2"
        >
          {editingId === task.id ? (
            <>
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="border rounded p-1 w-40"
              />
              <button
                onClick={() => saveEdit(task.id)}
                className="text-green-500 hover:text-green-700 ml-2"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <span
                onClick={() => onToggle(task)}
                className={`cursor-pointer ${task.completed ? "line-through text-gray-500" : ""}`}
              >
                {task.title}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(task)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ✎
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
