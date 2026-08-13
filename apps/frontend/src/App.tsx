import { BrowserRouter, Route, Routes, useParams } from "react-router";
import "./index.css";
import { useEffect, useState } from "react";

export function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/board/:boardId" element={<Board />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function Board() {
  const { boardId } = useParams();
  const [users, setUsers] = useState<Array<{ id: string | number }>>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3002");

    ws.onmessage = ev => {
      const data = JSON.parse(ev.data) as {
        type?: string;
        users?: Array<{ id: string | number }>;
        userId?: string | number;
      };

      if (data.type === "initial_state") {
        setUsers(data.users ?? []);
      }

      if (data.type === "join") {
        setUsers(currentUsers => [...currentUsers, { id: data.userId ?? "unknown" }]);
      }

      if (data.type === "leave") {
        setUsers(currentUsers => currentUsers.filter(user => user.id !== data.userId));
      }
    };

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "join",
        boardId: boardId
      }))
    }

    return () => ws.close();
  }, []);

  return (
    <div>
      You are on board {boardId}
      <br />
      Currently active users - {JSON.stringify(users)}
    </div>
  );
}

export default App;
