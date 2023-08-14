import {useSelector} from "react-redux";
const DetailPage = () => {
    const search = useSelector((state: any) => state.search)

    return (
        <div>
            <div>
                <span style={{
                    fontSize: '25px',
                    fontWeight: 'bold',
                    marginRight: '5px'
                }}>
                    {search.selectedResult.document}
                </span>
                <sup style={{color: 'grey'}}> {search.selectedResult.score}</sup>
                <pre>
                    {search.selectedResult.source}
                </pre>
            </div>
        </div>
    )
};

export default DetailPage;
