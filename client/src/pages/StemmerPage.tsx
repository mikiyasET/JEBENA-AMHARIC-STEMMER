import {useDispatch, useSelector} from "react-redux";
import {setLoading, setStemmerQuery, setStemmerResults} from "../redux/features/stemmerSlice.ts";

const StemmerPage = () => {
    const stemmer = useSelector((state: any) => state.stemmer)
    const dispatch = useDispatch<any>()
    const handleStemmer = async () => {
        if (stemmer.query.trim().length > 0) {
            dispatch(setStemmerResults(''))
            const response = await fetch(`http://localhost:3000/stemmer/${stemmer.query}`);
            const data = await response.text();
            dispatch(setStemmerResults(data))
            dispatch(setStemmerResults(data))
        } else {
            alert("Query empty!!!");
        }
    }

    return (
        <>
            <nav className="navigation standard-padding ">
                <div className="logo">
                    <h1>JEBENA</h1>
                </div>
                <div className="nav-links">
                    <a href="/">Home</a>
                    <a href="/stemmer/" className="activeLink">Stemmer</a>
                </div>
            </nav>
            <main className="searchBar-container">
                <div className="searchBar searchBar-padding">
                    <input id="searchQueryInput" type="text" placeholder="Search" value={stemmer.query} onChange={e => dispatch(setStemmerQuery(e.target.value))}/>
                    <button id="searchQuerySubmit" type="submit" onClick={async () => {
                        dispatch(setLoading(true));
                        await handleStemmer();
                        dispatch(setLoading(false));
                    }}>
                        <svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
                            <path fill="#4B92E8"
                                  d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                        </svg>
                    </button>
                </div>
            </main>

            <center>
                <div style={{ fontSize: '20px',marginTop: '50px' }}>
                    {stemmer.loading && <p>Loading...</p>}
                    {stemmer.results && stemmer.results}
                </div>
            </center>
        </>
    )
};

export default StemmerPage;
