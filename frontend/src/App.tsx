import { Link } from "react-router-dom";
import { TaskListPage } from "./pages/TaskListPage";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="app-title">
          Task Assignment
        </Link>
      </header>
      <main className="app-main">
        <TaskListPage />
      </main>
    </div>
  );
}

export default App;


