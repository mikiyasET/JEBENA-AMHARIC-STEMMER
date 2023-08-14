import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState: any = {
    query: "",
    state: 0,
    results: [],
    selectedResult: null,
    searchDone: false,
}

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<any>) => {
            state.query = action.payload;
        },
        goToNextState: (state) => {
            state.state = state.state + 1;
        },
        goToPreviousState: (state) => {
            if (state.state > 0) {
                state.state = state.state - 1;
            }
        },
        setSearchedResults: (state, action: PayloadAction<any>) => {
            state.results = action.payload;
        },
        setSelectedResult: (state, action: PayloadAction<any>) => {
            state.selectedResult = action.payload;
        },
        setSearchDone: (state, action: PayloadAction<any>) => {
            state.searchDone = action.payload;
        }
    }
});

export default searchSlice.reducer;

export const { setSearchDone,setSelectedResult,setSearchQuery, goToNextState,goToPreviousState, setSearchedResults } = searchSlice.actions;