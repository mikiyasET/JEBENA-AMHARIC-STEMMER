import {useDispatch, useSelector} from "react-redux";
import {setSearchDone, setSearchedResults, setSearchQuery, setSelectedResult} from "../redux/features/searchSlice.ts";
import {useEffect} from "react";
import LoadingPage from "./LoadingPage.tsx";
import {useNavigate} from "react-router-dom";

const ResultPage = () => {
    const search = useSelector((state: any) => state.search)
    const dispatch = useDispatch<any>()
    let navigate = useNavigate();

    const handleFetchData = async () => {
        dispatch(setSearchedResults([]))
        dispatch(setSearchDone(false))
        const response = await fetch(`http://localhost:3000/search/${search.query}`);
        const data = await response.text();
        dispatch(setSearchDone(true))
        dispatch(setSearchedResults(JSON.parse(data)))
    }

    useEffect(() => {
        if (search.query === '') {
            navigate('/');
        }
        if (search.selectedResult == null) {
            handleFetchData();
        }
    }, [])
    const result = search.results;
    console.log(result);

    return (!search.searchDone ? <LoadingPage/> : (
        <>
            <nav className="navigation standard-padding ">
                <div className="searchBar">
                    <input id="searchQueryInput" type="text" placeholder="Search" value={search.query}
                           onChange={e => dispatch(setSearchQuery(e.target.value))}/>
                    <button id="searchQuerySubmit" type="submit" onClick={() => search.query.trim().length > 0 ? dispatch(handleFetchData()) : alert("Query empty!!!")}>
                        <svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
                            <path fill="#4B92E8"
                                  d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                        </svg>
                    </button>
                </div>
                <div></div>
            </nav>

            <main className="resultPage-container standard-padding ">
                {result.length > 0 && <span style={{
                    color: 'grey',
                    fontSize: '13px',
                    fontWeight: '500',
                    marginLeft: '2%'
                }}>About {result?.length ?? 0} results</span>}
                {result.length === 0 && <center style={{width: "50%"}}><h2 style={{color: 'grey'}} >No results found</h2></center>}
                {result.length > 0 && result.map((doc: any, index: any) => {
                        const contentWords = doc.highlightedContent.split(/\s+/);

                        return (
                            <div className="resultPage-result" key={index}>
                                <div className="resultPage-result-title">
                                    <p>Found in {doc.document}</p>
                                </div>
                                <div className="resultPage-result-content"
                                     onClick={() => {
                                         dispatch(setSelectedResult(doc));
                                         navigate('/details');
                                     }}>
                                    <p>
                                        {contentWords.map((word: string, wordIndex: number) => (
                                             search.query.split(" ").includes(word.trim()) ? (
                                                <span key={wordIndex} className="highlight">
                                {word + ' '}
                            </span>
                                            ) : (
                                                <span key={wordIndex}>
                                {word + ' '}
                            </span>
                                            )
                                        ))}
                                        {/*{contentWords.map((word: string, wordIndex: number, arr: string[]) => {*/}
                                        {/*    const isQuery = word === search.query;*/}
                                        {/*    if (isQuery) {*/}
                                        {/*        const startIndex = Math.max(wordIndex - maxContextWords, 0);*/}
                                        {/*        const endIndex = Math.min(wordIndex + maxContextWords + 1, arr.length);*/}
                                        {/*        const context = arr.slice(startIndex, endIndex);*/}
                                        {/*        const q: any[] = search.query.split(" ")*/}
                                        {/*        if (q.join(" ").includes(word)) {*/}
                                        {/*            return (*/}
                                        {/*                <span key={`${wordIndex}`} className="highlight">*/}
                                        {/*                        {word + ' '}*/}
                                        {/*                    </span>*/}
                                        {/*            );*/}
                                        {/*        } else {*/}
                                        {/*            return context.map((word: string, index: number) => {*/}
                                        {/*                console.log(word + " --- ")*/}
                                        {/*                if (q.includes(word)) {*/}
                                        {/*                    return (*/}
                                        {/*                        <span key={`${wordIndex}:${index}`}*/}
                                        {/*                              className="highlight">*/}
                                        {/*                        {word + ' '}*/}
                                        {/*                    </span>*/}
                                        {/*                    );*/}
                                        {/*                } else {*/}
                                        {/*                    return (*/}
                                        {/*                        <span key={`${wordIndex}:${index}`}>*/}
                                        {/*                        {word + ' '}*/}
                                        {/*                    </span>*/}
                                        {/*                    );*/}
                                        {/*                }*/}
                                        {/*            })*/}
                                        {/*        }*/}
                                        {/*    } else {*/}
                                        {/*        return (*/}
                                        {/*            <></>*/}
                                        {/*        );*/}
                                        {/*    }*/}
                                        {/*})}*/}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                }
            </main>
            <footer></footer>
        </>
    ))
};

export default ResultPage;
