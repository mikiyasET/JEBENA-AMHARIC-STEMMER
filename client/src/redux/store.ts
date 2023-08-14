import {configureStore} from "@reduxjs/toolkit";
import searchReducer from "./features/searchSlice.ts"
import stemmerReducer from "./features/stemmerSlice.ts"

export const store = configureStore({
    reducer: {
        search: searchReducer,
        stemmer: stemmerReducer
    },
});