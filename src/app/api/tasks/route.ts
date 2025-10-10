import { NextResponse } from "next/server";

let tasks: { id: number; title: string; completed: boolean }[] = [];
let idCounter = 1;

export async function GET() {
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const { title } = await req.json();
  const newTask = { id: idCounter++, title, completed: false };
  tasks.push(newTask);
  return NextResponse.json(newTask, { status: 201 });
}

export async function PUT(req: Request) {
  const { id, title, completed } = await req.json();
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, title, completed } : task
  );
  return NextResponse.json({ message: "Task updated" });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  tasks = tasks.filter((task) => task.id !== id);
  return NextResponse.json({ message: "Task deleted" });
}
