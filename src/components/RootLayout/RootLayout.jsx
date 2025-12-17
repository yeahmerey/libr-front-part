import { Outlet } from "react-router-dom";
import NavBar from "../NavBar/NavBar.jsx";

export default function RootLayout() {
  return (
    <div>
      <NavBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
