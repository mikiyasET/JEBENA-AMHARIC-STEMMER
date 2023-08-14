import {useDispatch, useSelector} from "react-redux";
import {setSearchedResults, setSearchQuery, setSelectedResult} from "../redux/features/searchSlice.ts";
import {useNavigate} from "react-router-dom";

const SearchPage = () => {
    const search = useSelector((state: any) => state.search)
    const dispatch = useDispatch<any>()
    let navigate = useNavigate();
    return (
        <>
            <nav className="navigation standard-padding ">
                <div className="logo">
                    <h1>JEBENA</h1>
                </div>
                <div className="nav-links">
                    <a href="/" className="activeLink">Home</a>
                    <a href="/stemmer/">Stemmer</a>
                </div>
            </nav>
            <main className="searchBar-container">
                <div className="searchBar searchBar-padding">
                    <input id="searchQueryInput" type="text" placeholder="Search" value={search.query} onChange={e => dispatch(setSearchQuery(e.target.value))}/>
                    <button id="searchQuerySubmit" type="submit" onClick={() => {
                        if (search.query.trim().length > 0) {
                            dispatch(setSearchedResults([]))
                            dispatch(setSelectedResult(null))
                            navigate('/result')
                        } else {
                            alert("Query empty!!!");
                        }
                    }}>
                        <svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
                            <path fill="#4B92E8"
                                  d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                        </svg>
                    </button>
                </div>
            </main>
        </>
    )
};

export default SearchPage;
