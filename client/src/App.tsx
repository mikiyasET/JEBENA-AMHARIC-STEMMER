import './App.css'
import SearchPage from "./pages/SeachPage.tsx";
// import {useSelector} from "react-redux";
import ResultPage from "./pages/ResultPage.tsx";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import StemmerPage from "./pages/StemmerPage.tsx";
import DetailPage from "./pages/DetailPage.tsx";

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <SearchPage />,
        },
        {
            path: "/result",
            element: <ResultPage />,
        },
        {
            path: "/details",
            element: <DetailPage />
        },
        {
            path: "/stemmer",
            element: <StemmerPage />
        }
    ]);

    // const search = useSelector((state: any) => state.search)

    // switch (search.state) {
    //     case 0:
    //         return <SearchPage />
    //     case 1:
    //         return <ResultPage />
    //     default:
    //         return <h1>Wow</h1>
    // }
    return <RouterProvider router={router}/>
}

export default App
