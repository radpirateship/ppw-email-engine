// ============================================================================
// PPW Email Engine — Kanban Task Board
// Visual task management for tracking email marketing implementation progress.
// Auto-generates tasks from flow definitions with drag-and-drop columns.
// ============================================================================

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  type KanbanTask,
  type KanbanColumn,
  type TaskPriority,
  type TaskCategory,
  COLUMNS,
  loadKanbanTasks,
  saveKanbanTasks,
  mergeWithAutoTasks,
  getTasksByColumn,
  getTaskStats,
  moveTask,
  addManualTask,
  deleteTask,
} from "@/framework/kanban";

// ---------------------------------------------------------------------------
// Color maps
// ---------------------------------------------------------------------------

const COLUMN_COLORS: Record<KanbanColumn, { bg: string; border: string; header: string; count: string; dot: string }> = {
  backlog: { bg: "bg-gray-50", border: "border-gray-200", header: "text-gray-700", count: "bg-gray-200 text-gray-700", dot: "bg-gray-400" },
  todo: { bg: "bg-blue-50/50", border: "border-blue-200", header: "text-blue-700", count: "bg-blue-100 text-blue-700", dot: "bg-blue-400" },
  "in-progress": { bg: "bg-amber-50/50", border: "border-amber-200", header: "text-amber-700", count: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
  done: { bg: "bg-green-50/50", border: "border-green-200", header: "text-green-700", count: "bg-green-100 text-green-700", dot: "bg-green-400" },
};

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-100", text: "text-red-700", label: "Critical" },
  high: { bg: "bg-orange-100", text: "text-orange-700", label: "High" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium" },
  low: { bg: "bg-gray-100", text: "text-gray-600", label: "Low" },
};

const CATEGORY_STYLES: Record<TaskCategory, { icon: string; label: string }> = {
  "klaviyo-setup": { icon: "⚙️", label: "Klaviyo Setup" },
  "flow-build": { icon: "⚡", label: "Flow Build" },
  "discount-setup": { icon: "🏷️", label: "Discount Setup" },
  "content-create": { icon: "✏️", label: "Content" },
  integration: { icon: "🔗", label: "Integration" },
  testing: { icon: "🧪", label: "Testing" },
  optimization: { icon: "📊", label: "Optimization" },
  general: { icon: "📋", label: "General" },
};

const SOURCE_LABELS: Record<string, string> = {
  "auto-flow": "Auto · Flow",
  "auto-onboarding": "Auto · Setup",
  "auto-prerequisite": "Auto · Prereq",
  manual: "Manual",
};

// ---------------------------------------------------------------------------
// Task Card component
// ---------------------------------------------------------------------------

function TaskCard({
  task,
  onMove,
  onDelete,
  isExpanded,
  onToggleExpand,
}: {
  task: KanbanTask;
  onMove: (taskId: string, column: KanbanColumn) => void;
  onDelete: (taskId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const pStyle = PRIORITY_STYLES[task.priority];
  const cStyle = CATEGORY_STYLES[task.category];

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        task.column === "done" ? "opacity-70" : ""
      }`}
      onClick={onToggleExpand}
    >
      <div className="px-3 py-2.5">
        {/* Top row: priority + category */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${pStyle.bg} ${pStyle.text}`}>
            {pStyle.label}
          </span>
          <span className="text-[10px] text-gray-400">
            {cStyle.icon} {cStyle.label}
          </span>
          <span className="text-[10px] text-gray-300 ml-auto">
            {SOURCE_LABELS[task.source] ?? task.source}
          </span>
        </div>

        {/* Title */}
        <h4 className={`text-sm font-medium leading-tight ${
          task.column === "done" ? "text-gray-500 line-through" : "text-gray-900"
        }`}>
          {task.title}
        </h4>

        {/* Time estimate */}
        {task.estimatedMinutes && (
          <p className="text-[10px] text-gray-400 mt-1">
            ~{task.estimatedMinutes >= 60
              ? `${Math.floor(task.estimatedMinutes / 60)}h${task.estimatedMinutes % 60 > 0 ? ` ${task.estimatedMinutes % 60}m` : ""}`
              : `${task.estimatedMinutes}m`}
          </p>
        )}

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs text-gray-600 leading-relaxed mb-3">{task.description}</p>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {task.tags.map((tag) => (
                  <span key={tag} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Move buttons */}
            <div className="flex gap-1.5 flex-wrap">
              {COLUMNS.filter((c) => c.id !== task.column).map((col) => {
                const cc = COLUMN_COLORS[col.id];
                return (
                  <button
                    key={col.id}
                    onClick={() => onMove(task.id, col.id)}
                    className={`text-[10px] font-medium px-2 py-1 rounded border transition-colors hover:opacity-80 ${cc.count}`}
                  >
                    → {col.label}
                  </button>
                );
              })}
              {task.source === "manual" && (
                <button
                  onClick={() => {
                    if (confirm("Delete this task?")) onDelete(task.id);
                  }}
                  className="text-[10px] font-medium px-2 py-1 rounded border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors ml-auto"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column component
// ---------------------------------------------------------------------------

function KanbanColumnUI({
  column,
  tasks,
  expandedId,
  onToggleExpand,
  onMove,
  onDelete,
}: {
  column: (typeof COLUMNS)[number];
  tasks: KanbanTask[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onMove: (taskId: string, column: KanbanColumn) => void;
  onDelete: (taskId: string) => void;
}) {
  const cc = COLUMN_COLORS[column.id];

  return (
    <div className={`flex flex-col min-h-0 rounded-xl border ${cc.border} ${cc.bg}`}>
      {/* Column header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100">
        <span className={`w-2.5 h-2.5 rounded-full ${cc.dot}`} />
        <h3 className={`text-sm font-bold ${cc.header}`}>{column.label}</h3>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cc.count}`}>
          {tasks.length}
        </span>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ maxHeight: "calc(100vh - 320px)" }}>
        {tasks.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4 italic">No tasks</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onMove={onMove}
              onDelete={onDelete}
              isExpanded={expandedId === task.id}
              onToggleExpand={() => onToggleExpand(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Task Modal
// ---------------------------------------------------------------------------

function AddTaskModal({ onAdd, onClose }: { onAdd: (title: string, desc: string, cat: TaskCategory, priority: TaskPriority) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState<TaskCategory>("general");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add Task</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Task title..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
              rows={3}
              placeholder="What needs to be done..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as TaskCategory)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {Object.entries(CATEGORY_STYLES).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {Object.entries(PRIORITY_STYLES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (title.trim()) {
                onAdd(title.trim(), desc.trim(), cat, priority);
                onClose();
              }
            }}
            disabled={!title.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 rounded-lg transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats Bar
// ---------------------------------------------------------------------------

function StatsBar({ tasks }: { tasks: KanbanTask[] }) {
  const stats = useMemo(() => getTaskStats(tasks), [tasks]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Implementation Progress</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {stats.byColumn.done} of {stats.total} tasks complete
            {stats.remainingMinutes > 0 && (
              <> &middot; ~{Math.round(stats.remainingMinutes / 60)}h remaining</>
            )}
          </p>
        </div>
        <span className="text-2xl font-bold text-green-700">{stats.completionPercentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
        {stats.byColumn.done > 0 && (
          <div className="bg-green-500 h-3 transition-all" style={{ width: `${(stats.byColumn.done / stats.total) * 100}%` }} />
        )}
        {stats.byColumn["in-progress"] > 0 && (
          <div className="bg-amber-400 h-3 transition-all" style={{ width: `${(stats.byColumn["in-progress"] / stats.total) * 100}%` }} />
        )}
        {stats.byColumn.todo > 0 && (
          <div className="bg-blue-400 h-3 transition-all" style={{ width: `${(stats.byColumn.todo / stats.total) * 100}%` }} />
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mt-3">
        {COLUMNS.map((col) => {
          const cc = COLUMN_COLORS[col.id];
          return (
            <div key={col.id} className="text-center">
              <p className={`text-lg font-bold ${cc.header}`}>{stats.byColumn[col.id]}</p>
              <p className="text-[10px] text-gray-500">{col.label}</p>
            </div>
          );
        })}
      </div>

      {/* Discount alert */}
      {stats.discountTasks > 0 && stats.discountDone < stats.discountTasks && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          <span className="text-lg">🏷️</span>
          <p className="text-xs text-gray-600">
            <span className="font-medium text-amber-700">
              {stats.discountTasks - stats.discountDone} discount code{stats.discountTasks - stats.discountDone !== 1 ? "s" : ""}
            </span>{" "}
            need to be created in Shopify/Klaviyo before those flows can go live.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter Bar
// ---------------------------------------------------------------------------

type FilterType = "all" | TaskCategory | TaskPriority | "discount-setup";

function FilterBar({
  activeFilter,
  onFilter,
  tasks,
}: {
  activeFilter: FilterType;
  onFilter: (f: FilterType) => void;
  tasks: KanbanTask[];
}) {
  const discountCount = tasks.filter((t) => t.category === "discount-setup").length;

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "critical", label: "🔴 Critical", count: tasks.filter((t) => t.priority === "critical").length },
    { key: "discount-setup", label: "🏷️ Discounts", count: discountCount },
    { key: "klaviyo-setup", label: "⚙️ Setup", count: tasks.filter((t) => t.category === "klaviyo-setup").length },
    { key: "flow-build", label: "⚡ Flows", count: tasks.filter((t) => t.category === "flow-build").length },
    { key: "integration", label: "🔗 Integration", count: tasks.filter((t) => t.category === "integration").length },
  ];

  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilter(f.key)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            activeFilter === f.key
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          {f.label}
          {f.count !== undefined && f.count > 0 && (
            <span className={`ml-1.5 text-[10px] ${activeFilter === f.key ? "text-green-200" : "text-gray-400"}`}>
              {f.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function KanbanPage() {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [mounted, setMounted] = useState(false);

  // Load and merge tasks on mount
  useEffect(() => {
    const saved = loadKanbanTasks();
    const merged = mergeWithAutoTasks(saved);
    setTasks(merged);
    saveKanbanTasks(merged);
    setMounted(true);
  }, []);

  // Persist on change
  const updateTasks = useCallback((newTasks: KanbanTask[]) => {
    setTasks(newTasks);
    saveKanbanTasks(newTasks);
  }, []);

  const handleMove = useCallback(
    (taskId: string, column: KanbanColumn) => {
      updateTasks(moveTask(tasks, taskId, column));
    },
    [tasks, updateTasks]
  );

  const handleDelete = useCallback(
    (taskId: string) => {
      updateTasks(deleteTask(tasks, taskId));
    },
    [tasks, updateTasks]
  );

  const handleAdd = useCallback(
    (title: string, desc: string, cat: TaskCategory, priority: TaskPriority) => {
      updateTasks(addManualTask(tasks, title, desc, cat, priority));
    },
    [tasks, updateTasks]
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // Apply filter
  const filteredTasks = useMemo(() => {
    if (activeFilter === "all") return tasks;
    if (activeFilter === "critical") return tasks.filter((t) => t.priority === "critical");
    // TaskCategory filters
    return tasks.filter((t) => t.category === activeFilter);
  }, [tasks, activeFilter]);

  if (!mounted) {
    return (
      <div className="px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-80" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Implementation Board
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track every task needed to launch your email marketing system
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Stats */}
      <StatsBar tasks={tasks} />

      {/* Filters */}
      <FilterBar activeFilter={activeFilter} onFilter={setActiveFilter} tasks={tasks} />

      {/* Kanban Columns */}
      <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
        {COLUMNS.map((col) => (
          <KanbanColumnUI
            key={col.id}
            column={col}
            tasks={getTasksByColumn(filteredTasks, col.id)}
            expandedId={expandedId}
            onToggleExpand={toggleExpand}
            onMove={handleMove}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* How it works note */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-[10px] text-gray-400">
          Tasks are auto-generated from your flow definitions and onboarding steps. Discount codes, lists, segments, and other prerequisites are detected automatically.
          Move tasks between columns to track progress. Manual tasks can be added and deleted.
        </p>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
