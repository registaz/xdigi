import { Link } from "react-router-dom";
import { tasksApi } from "../api/tasks";
import { developersApi } from "../api/developers";
import { useFetch } from "../hooks/useAsync";
import { TaskRow } from "../components/TaskRow";

export function TaskListPage() {
  const tasksState = useFetch(() => tasksApi.list());
  const developersState = useFetch(() => developersApi.list());

  const loading = tasksState.loading || developersState.loading;
  const error = tasksState.error ?? developersState.error;
  const tasks = tasksState.data ?? [];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tasks</h1>
        <Link className="button button--primary" to="/tasks/new">
          + New Task
        </Link>
      </div>

      {loading && <p className="hint">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="task-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Skills</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Subtasks</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No tasks yet. Create one to get started.
                  </td>
                </tr>
              )}
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  depth={0}
                  developers={developersState.data ?? []}
                  onChanged={tasksState.reload}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
