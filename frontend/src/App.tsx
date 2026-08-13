import { Link, Route, Routes } from "react-router-dom";
import { TaskListPage } from "./pages/TaskListPage";
import { CreateTaskPage } from "./pages/CreateTaskPage";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="app-title">
          Task Assignment
        </Link>
        <nav className="app-nav">
          <Link to="/">Tasks</Link>
          <Link to="/tasks/new">New Task</Link>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<TaskListPage />} />
          <Route path="/tasks/new" element={<CreateTaskPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;


