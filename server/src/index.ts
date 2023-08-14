import express, {Request, Response} from "express";
import {core} from "./utils/core";
import {Vector} from "./utils/vector";

const app = express();
const cors = require('cors');
const port = 3000;

app.use(cors());
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.get('/stemmer/:word', (req: Request, res: Response) => {
    const word = req.params.word;
    const c = new core();
    res.send(c.main(word));
});

app.get('/index', (req: Request, res: Response) => {
    const c = new core();
    res.send(c.indexer())
});

app.get('/search/:word', (req: Request, res: Response) => {
    const c = new core();
    c.query = c.main(req.params.word);
    c.Search().then((result) => {
        res.send(result);
    })
});

app.get('/vector', (req: Request, res: Response) => {
    const vector = new Vector();
    vector.uniqueProcess("gold silver truck".split(" "));

    vector.TFIDF().then((result) => {
        const store = {
            tfIDF: result,
            qtfIDF: vector.QTFIDF(),
            filesList: vector.filesList
        }
        res.send(store);
    });
});

app.listen(port, async () => {

    console.log(`Example app listening at http://localhost:${port}`);
});