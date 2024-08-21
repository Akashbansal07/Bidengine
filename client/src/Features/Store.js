import {configureStore} from "@reduxjs/toolkit";
import themeSliceReducer from "./themeSlice";
export const store = configureStore({
    reducer : {
        themekey : themeSliceReducer,
    },
});

export default store;