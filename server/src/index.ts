import express, {Request, Response} from "express";
import {core} from "./utils/core";
const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.get('/swap/:word', (req:Request, res:Response) => {
    const word = req.params.word;
    const c = new core();
    res.send(c.main(word));
});

app.get('/index', (req:Request, res:Response) => {
    const c = new core();
    res.send(c.indexer())
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});