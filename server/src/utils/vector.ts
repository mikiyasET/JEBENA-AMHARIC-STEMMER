import fs from "fs";
import path from "path";
import {INDEXED_FILES_PATH} from "../constants/constants";

export class Vector {
    private allWords: string[] = [];
    private documentsWords: string[] = [];
    private queryWords: any[] = [];
    private queryTF: any[] = [];
    public filesList: string[] = [];

    public TF() {
        const qtf: any[] = [];
        const x = this.allWords.map((allWord) => {
            let doc: any[] = [];
            this.documentsWords.map((words) => {
                let tf = 0;
                const wordsArr = words.split(" ");
                wordsArr.map((word) => {
                    if (word == allWord) {
                        tf++;
                    }
                })
                doc.push(tf);
            })
            return doc;
        })
        // console.log(x)
        return x;
    }
    public QTF() {
        console.log("Query Words: ", this.queryWords)
        const x = this.allWords.map((allWord) => {
            let counter = 0;
            this.queryWords.map((word) => {
                if (this.queryWords.includes(allWord)) {
                    if (word == allWord) {
                        counter++;
                    }
                }
            })
            return counter;
        })
        return x;
    }

    public DF(): number[] {
        return this.allWords.map((q) => {
            let df = 0;
            this.documentsWords.map((words) => {
                if (words.indexOf(q) != -1) {
                    df++;
                }
            });
            return df;
        })
    }

    public IDF() {
        const documentsLength = this.documentsWords.length;
        // const dfi = this.DF().reduce((a, b) => a + b, 0);
        // const ddfi = documentsLength / dfi;
        const ddfi = this.DF().map((df) => {
            return documentsLength / df;
        })
        // idf = log10(ddfi)
        const idf = ddfi.map((ddfi) => {
            return Math.log(ddfi) / Math.log(10);
        });
        return idf;
    }

    public async TFIDF(): Promise<any[][]> {
        return new Promise((resolve) => {
            const tf = this.TF(); // [[], [], [], []] each array represents each word in query
            const idf = this.IDF(); // [] each element represents each word in query
            const result: any = tf.map((t, i) => {
                return t.map((tt) => {
                    return tt * idf[i];
                });

                // return {[this.allWords[i]]: t.map((tt) => {
                //         return tt * idf[i];
                //     })
                // };
            });
            resolve(result);
        });
    }
    public QTFIDF(): any[][] {
        const qtf = this.QTF();
        const idf = this.IDF();
        console.log("QTF: ", qtf)
        console.log("IDF: ", idf)

        const result: any = qtf.map((t, i) => {
            return t * idf[i];
        })
        console.log(result)
        return result;
    }

    public async Magnitude() {
        const tfIDF = await this.TFIDF();
        let docs: any[] = [];
        tfIDF.map((words, ind) => {
            words.map((doc, index) => {
                if (docs[index]?.length > 0) {
                    docs[index] = [...docs[index], doc]
                } else {
                    docs[index] = [doc]
                }
            })
        });

        const magnitude = docs.map((doc) => {
            return Math.sqrt(doc.reduce((a: any, b: any) => a + b * b, 0));
        })
        return magnitude;
    }

    public Process() {
        const outPath = path.join(__dirname, "../test");
        const files = fs.readdirSync(outPath);
        const result = files.map((file: any) => {
            if (file.startsWith('Document')) {
                const data = fs.readFileSync(path.join(outPath, file), "utf8");
                // this.filesList.push(file);
                this.documentsWords.push(data.replace(/\n/g, ' '));
            }
        });
        this.documentsWords.map((words) => {
            const wordsArr = words.split(" ");
            wordsArr.map((word) => {
                if (this.allWords.indexOf(word) == -1) {
                    this.allWords.push(word);
                }
            })
        })
    }

    public uniqueProcess(words: string[]) {
        const outPath = INDEXED_FILES_PATH;
        const files = fs.readdirSync(outPath);
        const result = files.map((file: any) => {
            if (file.startsWith('Document')) {
                const data = fs.readFileSync(path.join(outPath, file), "utf8");
                this.filesList.push(file);
                // console.log(file)
                this.documentsWords.push(data.replace(/\n/g, ' '));
            }
        });
        this.documentsWords.map((words) => {
            const wordsArr = words.split(" ");
            wordsArr.map((word) => {
                if (this.allWords.indexOf(word) == -1) {
                    this.allWords.push(word);
                }
            })
        })
        this.queryWords = words;
    }
}