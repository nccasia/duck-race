import { useEffect } from "react";
import "./App.css";
import RouteManager from "./routes";
import { MezonAppEvent, MezonWebViewEvent } from "./types/webview";
import AppProvider from "./providers/AppProvider";
import { ToastContainer } from "react-toastify";
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
        <ToastContainer
          position='top-right'
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='light'
        />
      </div>
    </AppProvider>
  );
}

export default App;
