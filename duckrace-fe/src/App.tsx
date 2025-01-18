import { useEffect } from "react";
import "./App.css";
import RouteManager from "./routes";
import { MezonAppEvent, MezonWebViewEvent } from "./types/webview";
import AppProvider from "./providers/AppProvider";

function App() {
  useEffect(() => {
    window?.Mezon?.WebView?.postEvent("PING" as MezonWebViewEvent, { message: "Hello Mezon!" }, () => {});
    window?.Mezon?.WebView?.onEvent("PONG" as MezonAppEvent, (data) => {
      console.log("Hello Mezon Again!", data);
    });
  });
  return (
    <AppProvider>
      <div className='flex justify-center items-center h-screen'>
        <RouteManager />
      </div>
    </AppProvider>
  );
}

export default App;
