import React from "react";
import { Route , Routes  } from "react-router-dom";
import App from "./App";

export const AppRoutes = ()=>{
    <Routes>
        <Route path="/" Component={App}></Route>
        <React path='/:uuid' Component={App}></React>
        <Route Component={null}></Route>
    </Routes>
}