import {useDispatch, useSelector} from "react-redux";
import {setSearchedResults, setSearchQuery} from "../redux/features/searchSlice.ts";
import {useEffect} from "react";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'

const LoadingPage = () => {
    const search = useSelector((state: any) => state.search)
    const dispatch = useDispatch<any>()

    const handleFetchData = async () => {
        dispatch(setSearchedResults([]))
        const response = await fetch(`http://localhost:3000/search/${search.query}`);
        const data = await response.text();
        dispatch(setSearchedResults(JSON.parse(data)))
    }

    useEffect(() => {
        if (search.selectedResult == null) {
            handleFetchData();
        }
    }, [])
    const result = search.results;
    console.log(result);

    return <>
            <nav className="navigation standard-padding ">
                <div className="searchBar">
                    <input id="searchQueryInput" type="text" placeholder="Search" value={search.query}
                           onChange={e => dispatch(setSearchQuery(e.target.value))} disabled={true}/>
                    <button id="searchQuerySubmit" type="submit" onClick={() => dispatch(handleFetchData())}>
                        <svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
                            <path fill="#4B92E8"
                                  d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                        </svg>
                    </button>
                </div>
                <div></div>
            </nav>

            <main className="resultPage-container standard-padding ">
                <Skeleton height={130} count={5} style={{ marginBottom: '10px',width: '50%'}} />
            </main>
            <footer></footer>
        </>
};

export default LoadingPage;
