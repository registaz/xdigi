import { TaskListPage } from "./pages/TaskListPage";
import { ToastProvider } from "./components/Toast";
import "./App.css";

function App() {
  return (
    <ToastProvider>
      <div className="app-shell">
        <header className="app-header">
          <span className="app-title">Task Assignment</span>
        </header>
        <main className="app-main">
          <TaskListPage />
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;


