import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 🎯 서비스워커 정리 (앱 부팅 시 1회)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
}

createRoot(document.getElementById("root")!).render(<App />);
