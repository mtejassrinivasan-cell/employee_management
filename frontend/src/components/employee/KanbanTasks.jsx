import React, { useState } from 'react';
import { Icon } from '../../icons';
import { Modal } from '../Modal';

const COLUMNS = ['To Do', 'In Progress', 'Under Review', 'Completed'];

export const KanbanTasks = ({ tasks, onUpdateTaskStage, onAddTask, userName }) => {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form
  const [taskTitle, setTaskTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', String(taskId));
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e, colIndex) => {
    e.preventDefault();
    setDragOverCol(colIndex);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, colIndex) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = Number(e.dataTransfer.getData('text/plain') || draggedTaskId);
    if (taskId) {
      onUpdateTaskStage(taskId, colIndex);
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onAddTask({
      id: Date.now(),
      t: taskTitle.trim(),
      p: priority,
      d: dueDate.trim() || 'Pending',
      s: 0,
      assignee: userName || 'Me'
    });

    setTaskTitle('');
    setPriority('Medium');
    setDueDate('');
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="row" style={{ marginBottom: '12px', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, color: 'var(--mute)' }}>
          Drag cards across columns to update task progress.
        </p>
        <button type="button" className="btn" onClick={() => setIsModalOpen(true)}>
          <Icon name="plus" size={16} /> New Task
        </button>
      </div>

      <div className="kan">
        {COLUMNS.map((colName, colIdx) => {
          const colTasks = tasks.filter((t) => t.s === colIdx);
          const isOver = dragOverCol === colIdx;

          return (
            <div
              key={colIdx}
              className={`col ${isOver ? 'over' : ''}`}
              onDragOver={(e) => handleDragOver(e, colIdx)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, colIdx)}
            >
              <h4>
                {colName} <span className="pill">{colTasks.length}</span>
              </h4>

              {colTasks.map((t) => (
                <div
                  key={t.id}
                  className="task"
                  draggable
                  onDragStart={(e) => handleDragStart(e, t.id)}
                >
                  <p>{t.t}</p>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className={`pill ${t.p}`}>{t.p}</span>
                    <small>Due {t.d}</small>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* New Personal Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Personal Task">
        <form onSubmit={handleCreateTask}>
          <label>Task Title *</label>
          <input
            placeholder="e.g. Write integration test suite"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="fields">
            <div>
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label>Due Date</label>
              <input
                placeholder="e.g. Oct 20"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="row" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Add Task
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
