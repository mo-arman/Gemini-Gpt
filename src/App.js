import React from "react";
import ReactDOM from "react-dom/client";
import Sidebar from "./components/Sidebar/Sidebar";
import Main from "./components/Main/Main";
import ContextProvider from "./context/context";

const AppLayout = () => {
  return (
    <>
      <Sidebar />
      <Main />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ContextProvider>
   <AppLayout/>
  </ContextProvider>
);
