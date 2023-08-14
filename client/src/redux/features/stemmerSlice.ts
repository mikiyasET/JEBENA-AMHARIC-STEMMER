import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: any = {
    query: "",
    results: null,
    loading: false
}

const stemmerSlice = createSlice({
    name: 'stemmer',
    initialState,
    reducers: {
        setStemmerQuery: (state, action: PayloadAction<any>) => {
            state.query = action.payload;
        },
        setStemmerResults: (state, action: PayloadAction<any>) => {
            state.results = action.payload;
        },
        setLoading: (state, action: PayloadAction<any>) => {
            state.loading = action.payload;
        }
    }
});

export default stemmerSlice.reducer;

export const { setStemmerQuery,setStemmerResults,setLoading } = stemmerSlice.actions;