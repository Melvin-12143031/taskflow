
import { useCallback, useEffect, useState, useRef } from 'react'
import { useAuth } from '../contexts/useAuth'
import toast from 'react-hot-toast'


import TaskForm from '../components/TaskForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Footer from '../components/Footer'

import priorities from '../data/priorities.json'
import statuses from '../data/statuses.json'

import {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
} from '../lib/taskService'

const Dashboard = () => {
    const { user, signOut } = useAuth()

    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editingTask, setEditingTask] = useState(null)
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
    const [taskToDelete, setTaskToDelete] = useState(null)

    const [isCreatingTask, setIsCreatingTask] = useState(false)
    const isCreatingTaskRef = useRef(false)
    const [isUpdatingTask, setIsUpdatingTask] = useState(false)

    const [togglingTaskId, setTogglingTaskId] = useState(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [priorityFilter, setPriorityFilter] = useState('all')


    const filteredTasks = tasks.filter((task) => {
        const query = searchQuery.trim().toLowerCase()

        const matchesSearch =
            (task.title ?? '').toLowerCase().includes(query) ||
            (task.description ?? '').toLowerCase().includes(query)

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && !task.completed) ||
            (statusFilter === 'completed' && task.completed)

        const matchesPriority =
            priorityFilter === 'all' ||
            task.priority === priorityFilter

        return matchesSearch && matchesStatus && matchesPriority
    })


    const totalTasks = tasks.length

    const activeTasks = tasks.filter(
        (task) => !task.completed,
    ).length

    const completedTasks = tasks.filter(
        (task) => task.completed,
    ).length

    const completionRate =
        totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100)

    useEffect(() => {
        const loadTasks = async () => {
            setLoading(true)
            setError('')

            try {
                const data = await getTasks()
                setTasks(data)
            } catch (err) {
                setError(err.message || 'Unable to load tasks.')
            } finally {
                setLoading(false)
            }
        }

        loadTasks()
    }, [])

    const handleCloseTaskForm = useCallback(() => {
        if (isCreatingTask || isUpdatingTask) return

        setIsTaskFormOpen(false)
        setEditingTask(null)
    }, [isCreatingTask, isUpdatingTask])

    useEffect(() => {
        if (!isTaskFormOpen) return

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                handleCloseTaskForm()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isTaskFormOpen, handleCloseTaskForm])

    const handleSignOut = async () => {
        const { error } = await signOut()

        if (error) {
            console.error('Unable to sign out:', error.message)
        }
    }


    const handleToggleTask = async (task) => {
        if (togglingTaskId !== null) return

        setTogglingTaskId(task.id)

        try {
            const updatedTask = await updateTask(task.id, {
                completed: !task.completed,
            })

            setTasks((currentTasks) =>
                currentTasks.map((currentTask) =>
                    currentTask.id === updatedTask.id
                        ? updatedTask
                        : currentTask,
                ),
            )

            toast.success(
                updatedTask.completed
                    ? 'Task marked as completed!'
                    : 'Task marked as active!',
            )
        } catch (err) {
            console.error('Error updating task status:', err)
            toast.error('Unable to update task status. Please try again.')
        } finally {
            setTogglingTaskId(null)
        }
    }


    const handleConfirmDelete = async () => {
        if (!taskToDelete) return

        try {
            await deleteTask(taskToDelete.id)

            setTasks((currentTasks) =>
                currentTasks.filter((task) => task.id !== taskToDelete.id),
            )

            if (editingTask?.id === taskToDelete.id) {
                setEditingTask(null)
            }

            toast.success('Task deleted successfully!')
            setTaskToDelete(null)
        } catch (err) {
            const message = err.message || 'Unable to delete the task.'
            setError(message)
            toast.error(message)
        }
    }

    const handleCreateTask = async (taskData) => {

        if (isCreatingTaskRef.current) return

        isCreatingTaskRef.current = true
        setIsCreatingTask(true)

        try {
            const task = await createTask({
                ...taskData,
                user_id: user.id,
            })

            setTasks((currentTasks) => [task, ...currentTasks])
            toast.success('Task created successfully!')
            setIsTaskFormOpen(false)
        } catch (err) {
            console.error('Error creating task:', err)
            toast.error('Unable to create your task. Please try again.')
        } finally {
            isCreatingTaskRef.current = false
            setIsCreatingTask(false)
        }
    }

    const handleUpdateTask = async (taskId, updates) => {
        setIsUpdatingTask(true)

        try {
            const updatedTask = await updateTask(taskId, updates)

            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    task.id === taskId ? updatedTask : task,
                ),
            )

            setEditingTask(null)
            toast.success('Task updated successfully!')
            setIsTaskFormOpen(false)
        } catch (err) {
            console.error('Error updating task:', err)

            setError('Unable to update your task. Please try again.')
            toast.error('Unable to update your task. Please try again.')

            throw err
        } finally {
            setIsUpdatingTask(false)
        }
    }


    return (
        <main className="flex min-h-screen flex-col bg-slate-950 px-6 py-8 text-white">
            <div className="mx-auto w-full max-w-6xl flex-1">
                <header className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
                            TaskFlow
                        </p>

                        <h1 className="mt-2 text-3xl font-bold">
                            Your Dashboard
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Welcome back, {user?.email || 'User'}!
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setEditingTask(null)
                                setIsTaskFormOpen(true)
                            }}
                            className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                        >
                            + Add Task
                        </button>

                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Sign Out
                        </button>

                    </div>
                </header>

                <section className="py-10">
                    {isTaskFormOpen && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="task-form-title"
                            onClick={handleCloseTaskForm}
                        >
                            <div
                                className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
                                onClick={(event) => event.stopPropagation()}
                            >
                                <TaskForm
                                    key={editingTask?.id ?? 'new-task'}
                                    onCreateTask={handleCreateTask}
                                    onUpdateTask={handleUpdateTask}
                                    onCancel={handleCloseTaskForm}
                                    initialTask={editingTask}
                                    submitLabel={editingTask ? 'Save Changes' : 'Create Task'}
                                    isSubmitting={isCreatingTask || isUpdatingTask}
                                />
                            </div>
                        </div>
                    )}

                    <div className="mb-6 mt-8">
                        <div className="mb-8 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-400">
                                        All Tasks
                                    </p>

                                    <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                                        Total
                                    </span>
                                </div>

                                <p className="mt-4 text-3xl font-bold text-white">
                                    {totalTasks}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Tasks in your workspace
                                </p>
                            </div>

                            <div className="rounded-xl border border-emerald-500/20 bg-slate-900 p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-400">
                                        Active Tasks
                                    </p>

                                    <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                        Active
                                    </span>
                                </div>

                                <p className="mt-4 text-3xl font-bold text-emerald-400">
                                    {activeTasks}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Still need your attention
                                </p>
                            </div>

                            <div className="rounded-xl border border-indigo-500/20 bg-slate-900 p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-400">
                                        Completed Tasks
                                    </p>

                                    <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400">
                                        Done
                                    </span>
                                </div>

                                <p className="mt-4 text-3xl font-bold text-indigo-400">
                                    {completedTasks}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Successfully completed
                                </p>
                            </div>
                        </div>

                        <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">
                                        Overall Progress
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {completedTasks} of {totalTasks} tasks completed
                                    </p>
                                </div>

                                <span className="text-lg font-bold text-emerald-400">
                                    {completionRate}%
                                </span>
                            </div>

                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>

                        <p className="mt-1 text-sm text-slate-400">
                            Your tasks are loaded from your Supabase database.
                        </p>

                        <div className="mt-4">
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search tasks by title or description..."
                                aria-label="Search tasks"
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
                            />


                            <div className="mt-4 flex flex-wrap gap-2">
                                {statuses.map((filter) => (
                                    <button
                                        key={filter.value}
                                        type="button"
                                        onClick={() => setStatusFilter(filter.value)}
                                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${statusFilter === filter.value
                                            ? filter.activeClass
                                            : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="mr-1 text-sm text-slate-400">
                                    Priority:
                                </span>

                                {priorities.map((filter) => (
                                    <button
                                        key={filter.value}
                                        type="button"
                                        onClick={() => setPriorityFilter(filter.value)}
                                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${priorityFilter === filter.value
                                            ? filter.activeClass
                                            : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>


                        </div>
                    </div>

                    {loading && (
                        <p className="text-slate-400">
                            Loading your tasks...
                        </p>
                    )}

                    {error && (
                        <p
                            role="alert"
                            className="mb-4 rounded-lg border border-red-900 bg-red-950/50 p-4 text-sm text-red-300"
                        >
                            {error}
                        </p>
                    )}

                    {!loading && !error && tasks.length === 0 && (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
                            <h3 className="text-lg font-semibold">
                                No tasks yet
                            </h3>

                            <p className="mt-2 text-slate-400">
                                Your tasks will appear here once you create your first one.
                            </p>
                        </div>
                    )}

                    {!loading && !error && tasks.length > 0 && (
                        <div className="space-y-3">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => (
                                    <article
                                        key={task.id}
                                        className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                                    >
                                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                            <div className="flex items-start gap-3">

                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleTask(task)}
                                                    disabled={togglingTaskId !== null}
                                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${task.completed
                                                        ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                                                        : 'border-slate-600 hover:border-emerald-400'
                                                        }`}
                                                    aria-label={
                                                        togglingTaskId === task.id
                                                            ? 'Updating task status'
                                                            : task.completed
                                                                ? 'Mark task as incomplete'
                                                                : 'Mark task as complete'
                                                    }
                                                >
                                                    {task.completed && '✓'}
                                                </button>


                                                <div>
                                                    <h3
                                                        className={`font-semibold ${task.completed
                                                            ? 'text-slate-500 line-through'
                                                            : 'text-white'
                                                            }`}
                                                    >
                                                        {task.title}
                                                    </h3>

                                                    {task.description && (
                                                        <p
                                                            className={`mt-2 text-sm ${task.completed
                                                                ? 'text-slate-600 line-through'
                                                                : 'text-slate-400'
                                                                }`}
                                                        >
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                                <span
                                                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${task.priority === 'high'
                                                        ? 'bg-red-500/10 text-red-400'
                                                        : task.priority === 'medium'
                                                            ? 'bg-yellow-500/10 text-yellow-400'
                                                            : 'bg-emerald-500/10 text-emerald-400'
                                                        }`}
                                                >
                                                    {task.priority}
                                                </span>

                                                <div className="ml-auto flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingTask(task)
                                                            setIsTaskFormOpen(true)
                                                        }}
                                                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setTaskToDelete(task)}
                                                        className="rounded-lg border border-red-500/20 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {task.due_date && (
                                            <p className="mt-4 text-sm text-slate-500">
                                                Due: {task.due_date}
                                            </p>
                                        )}
                                    </article>
                                ))
                            ) : (
                                <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
                                    <h3 className="font-semibold text-white">
                                        No matching tasks
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-400">
                                        Try a different search term.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {taskToDelete && (
                <ConfirmDialog
                    title="Delete Task?"
                    message={`Are you sure you want to delete "${taskToDelete.title}"? This action cannot be undone.`}
                    confirmLabel="Delete Task"
                    cancelLabel="Cancel"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setTaskToDelete(null)}
                    isLoading={false}
                    loadingLabel="Deleting task..."
                    isDangerous
                />
            )}
            <Footer />
        </main>
    )
}

export default Dashboard
