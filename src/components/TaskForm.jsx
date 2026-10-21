
import { useState } from 'react'

const TaskForm = ({
    onCreateTask,
    onUpdateTask,
    onCancel,
    initialTask,
    submitLabel,
    isSubmitting,
}) => {

    const [title, setTitle] = useState(initialTask?.title ?? '')
    const [description, setDescription] = useState(
        initialTask?.description ?? '',
    )
    const [priority, setPriority] = useState(
        initialTask?.priority ?? 'medium',
    )

    const getTodayDate = () => {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    const [dueDate, setDueDate] = useState(
        initialTask?.due_date ?? getTodayDate(),
    )

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')


    
    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (!title.trim()) {
            setError('Please enter a task title.')
            return
        }

        setLoading(true)

        try {

            const taskData = {
                title: title.trim(),
                description: description.trim(),
                priority,
                due_date: dueDate || null,
            }

            if (initialTask) {
                await onUpdateTask(initialTask.id, taskData)
            } else {
                await onCreateTask(taskData)
            }


            setTitle('')
            setDescription('')
            setPriority('medium')
            setDueDate('')
        } catch (err) {
            setError(err.message || 'Unable to create your task.')
        } finally {
            setLoading(false)
        }
    }

    const inputClasses =
        'w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400'

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-slate-900 p-5 sm:p-6"
        >
            <div className="flex items-center justify-between gap-4">
                <h2
                    id="task-form-title"
                    className="text-xl font-semibold"
                >
                    {initialTask ? 'Edit Task' : 'Create a Task'}
                </h2>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading || isSubmitting}
                    aria-label="Close task form"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-60"
                >
                    ✕
                </button>
            </div>

            <div>
                <label
                    htmlFor="task-title"
                    className="mb-2 block text-sm font-medium text-slate-300"
                >
                    Task title
                </label>
                <input
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="What do you need to do?"
                    maxLength={200}
                    required
                    className={inputClasses}
                />
            </div>

            <div>
                <label
                    htmlFor="task-description"
                    className="mb-2 block text-sm font-medium text-slate-300"
                >
                    Description <span className="text-slate-500">(optional)</span>
                </label>
                <textarea
                    id="task-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Add more details..."
                    rows={3}
                    className={inputClasses}
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="task-priority"
                        className="mb-2 block text-sm font-medium text-slate-300"
                    >
                        Priority
                    </label>
                    <select
                        id="task-priority"
                        value={priority}
                        onChange={(event) => setPriority(event.target.value)}
                        className={inputClasses}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="task-due-date"
                        className="mb-2 block text-sm font-medium text-slate-300"
                    >
                        Due date <span className="text-slate-500">(optional)</span>
                    </label>
                    <input
                        id="task-due-date"
                        type="date"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                        className={inputClasses}
                    />
                </div>
            </div>

            {error && (
                <p
                    role="alert"
                    className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300"
                >
                    {error}
                </p>
            )}


            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading || isSubmitting}
                    className="rounded-lg border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading || isSubmitting
                        ? initialTask
                            ? 'Saving changes...'
                            : 'Creating task...'
                        : submitLabel}
                </button>
            </div>

        </form>
    )
}

export default TaskForm
