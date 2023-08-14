import {common_amh_abbr_list} from "../constants/abbr";

const {stop_word_list} = require("../constants/stopwords");
const {punctuation_list} = require("../constants/punctuation");
import path from "path";
import fs from "fs";

export class core {

    // private stopWord: string[] = [
    //     "new","neber","aydelem","ena","keza","lay","belay","kelay","demo","wstt","bewstt","lewstt","awo","ay","ney","na","betam","bcha","liela","ezi","wedezi","slezi",
    //     "bihon","sle","alew","alat","enie","eswa","esu","enesu","erasu","berasu","lenersu","kenesu","benesu","yeesua","yeesu","yenesu","bzat","bebzat","endet","degmo",
    //     "liela","lielam", "yetu","yetua","yetochu","yhie","yeha","yegna","yenesu","bedemb","wstt","wcchi","eske","bemehal","bedar","entn","entna","nech","bzu","tinish",
    // ]
    public swapEng(query: string) {
        // roor dir >> constants >> fidel.json
        const fidels = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/fidel.json"), "utf8"));
        const words = query.split(" ");
        const result = words.map((word) => {
            const char = word.split("");
            const chars = char.map((c) => {
                if (fidels[c]) {
                    return fidels[c];
                }
                return c;
            });
            return chars.join("$$$");
        });


        return result.join(" ");
    }

    public swapAmh(query: string) {
        // roor dir >> constants >> fidel.json
        const fidels = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/fidel.json"), "utf8"));
        const words = query.split(" ");
        const result = words.map((word) => {
            const char = word.split("$$$");
            const chars = char.map((c) => {
                for (var i in fidels) {
                    var key = i;
                    var val = fidels[i];
                    if (val == c) {
                        return key;
                    }
                }
                return c;
            });
            return chars.join("");
        });

        return result.join(" ");
    }

    public main(query: string) {
        const queries: string[] = this.rmStopWord(this.lexicalAnalyzer(query)).split(" ");
        const qs = queries.map((q: string) => {
            const table = this.searchTable(q);
            if (table) {
                return table;
            } else {
                const english = this.remover(this.swapEng(q));
                const amharic = this.swapAmh(english);

                return amharic;
                // return {
                //     "en": english,
                //     "am": amharic
                // }
            }
        })
        return qs.join(" ");
    }

    public rmPunctuation(query: string): string {
        const chars = query.split("");
        let result = chars.map((char) => {
            if (!punctuation_list.includes(char)) {
                return char;
            }
        });
        return result.join("");
    }

    public rmStopWord(query: string) {
        const words = query.split(" ");
        let result = words.map((word) => {
            if (!stop_word_list.includes(word)) {
                return word;
            }
        });
        result = result.filter(e => e != undefined)
        return result.join(" ");
    }

    public remover(query: string) {
        const suffixRemoved = this.removeSuffix(query);
        const prefixRemoved = this.removePrefix(suffixRemoved);

        return prefixRemoved.replace(/\s\s+/g, ' ');
    }

    public searchTable(query: string) {
        const fidel = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/dic.json"), "utf8"));
        if (fidel[query]) {
            return fidel[query];
        }
    }

    public checkAmharic(x: string) {
        let flag = false;
        [...x].forEach((e, i) => {
            if (((e.charCodeAt(i) > 4607) && (e.charCodeAt(i) < 5018)) || ((e.charCodeAt(i) > 11647) && (e.charCodeAt(i) < 11743))) {
                if (flag == false) {
                    flag = true;
                }
            }
        })
        return flag;
    }

    public removePrefix(query: string) {
        const removePrefixes = ['ye', 'be', 's$$$le', 's$$$ne']
        if (query.replace('$$$', '').length >= 5) {
            for (const prefix in removePrefixes) {
                if (query.trim().startsWith(removePrefixes[prefix])) {
                    query = query.substring(removePrefixes[prefix].length)
                    break;
                }
            }
            return query;
        }
        return query;
    }

    public removeSuffix(query: string) {
        const removeSuffixes = ['wo$$$ch$$$n', 'wo$$$ch', 'o$$$ch$$$n', 'o$$$ch']
        const words = query.split(" ");
        let result = words.map((word) => {
            removeSuffixes.forEach((suffix) => {
                if (word.includes(suffix) && word.length > 6) {
                    word = word.replace(suffix, "");
                }
            })
            return word;
        })
        result = result.filter(e => e)
        return result.join(" ");
    }

    public lexicalAnalyzer(query: string) {
        for (const abbr in common_amh_abbr_list) {
            if (query.includes(abbr)) {
                query = query.replace(abbr, common_amh_abbr_list[abbr])
            }
        }
        query = this.rmPunctuation(query)

        return query;
    }

    public indexer() {
        try {
            console.log("Indexing started ...")
            const dirPath = path.join(__dirname, "../documents");
            const outPath = path.join(__dirname, "../indexed");
            let alreadyIndexed: string[] = [];
            fs.readdir(outPath, (err: any, files: any) => {
                if (!err) {
                    for (const file of files) {
                        alreadyIndexed.push(file);
                    }
                } else {
                    console.log(err)
                    return err;
                }
            })

            fs.readdir(dirPath, (err: any, files: any) => {
                if (!err) {
                    const fileSize = files.length;
                    let counter = 0;
                    for (const file of files) {
                        if (!alreadyIndexed.includes(file)) {
                            const filePath = path.join(dirPath, file);
                            fs.readFile(filePath, "utf8", async (err: any, data: any) => {
                                if (!err) {
                                    const result = await this.main(data);
                                    counter++;
                                    const percent = (counter / fileSize) * 100;
                                    console.log("Indexing done for file: ", file)
                                    console.log("Indexing progress: ", percent.toFixed(2), "%")
                                    await fs.writeFileSync(path.join(outPath, file), result, "utf8");
                                } else {
                                    console.log(err)
                                    return err;
                                }
                            })
                        } else {
                            counter++;
                        }
                    }
                } else {
                    console.log(err)
                    return err;
                }
            });
        } catch (error) {
            console.log("Error: ", error)
            return error;
        }
    }

    public search(query: string) {
        // do vector space model
        // do tf-idf
        // do cosine similarity
        // return result

        const outPath = path.join(__dirname, "../indexed");
        const files = fs.readdirSync(outPath);
        const result = files.map((file: any) => {
            const data = fs.readFileSync(path.join(outPath, file), "utf8");
            // const words = data.split(" ");
            const score = this.cosineSimilarity(query, data);
            return {
                "file": file,
                "score": score
            }
        })
        result.sort((a: any, b: any) => {
            return b.score - a.score;
        })
        return result;
    }

    public cosineSimilarity(query: string, document: string) {
        const queryWords = query.split(" ");
        const documentWords = document.split(" ");
        const queryVector = this.tfIdf(queryWords, documentWords);
        const documentVector = this.tfIdf(documentWords, queryWords);
        const dotProduct = this.dotProduct(queryVector, documentVector);
        const queryVectorMagnitude = this.magnitude(queryVector);
        const documentVectorMagnitude = this.magnitude(documentVector);
        const cosineSimilarity = dotProduct / (queryVectorMagnitude * documentVectorMagnitude);
        return cosineSimilarity;
    }

    public tfIdf(queryWords: string[], documentWords: string[]) {
        const tf = this.tf(queryWords, documentWords);
        const idf = this.idf(queryWords, documentWords);
        const tfIdf = tf.map((tf, i) => {
            return tf * idf[i];
        })
        return tfIdf;
    }

    public tf(queryWords: string[], documentWords: string[]) {
        const tf = queryWords.map((queryWord) => {
            const count = documentWords.filter((documentWord) => {
                return documentWord == queryWord;
            }).length;
            return count / documentWords.length;
        })
        return tf;
    }

    public idf(queryWords: string[], documentWords: string[]) {
        const idf = queryWords.map((queryWord) => {
            const count = documentWords.filter((documentWord) => {
                return documentWord == queryWord;
            }).length;
            return Math.log(documentWords.length / count);
        })
        return idf;
    }

    public dotProduct(queryVector: number[], documentVector: number[]) {
        let sum = 0;
        queryVector.forEach((query, i) => {
            sum += query * documentVector[i];
        })
        return sum;
    }

    public magnitude(vector: number[]) {
        let sum = 0;
        vector.forEach((v) => {
            sum += v * v;
        })
        return Math.sqrt(sum);
    }

    public myTF(query: string[], documents: string[]) {
        return query.map((q) => {
            let doc: any[] = [];
            documents.map((document) => {
                let tf = 0;
                const words = document.split(" ");
                words.map((word) => {
                    if (word == q) {
                        tf++;
                    }
                })
                doc.push(tf);
            })
            return doc;
        })
    }

    public myDF(query: string, documents: string[]) {
        let df = 0;
        documents.map((document) => {
            if (document.indexOf(query) != -1) {
                df++;
            }
        });
        return df;
    }

    public myIDF(query: string[], documents: string[]) {
        console.log("Document length: ",documents.length)
        return query.map((q) => {
            console.log(documents.length," / ",this.myDF(q, documents)," = ", documents.length / this.myDF(q, documents) , " ~ ", (Math.log(documents.length / this.myDF(q, documents)) /  Math.log(10)).toFixed(4))
            return parseFloat((Math.log(documents.length / this.myDF(q, documents)) / Math.log(10)).toFixed(4));
        })
    }

    public myTFIDF(query: string[], documents: string[]) {
        const tf = this.myTF(query, documents); // [[], [], [], []] each array represents each word in query
        const idf = this.myIDF(query, documents); // [] each element represents each word in query

        return tf.map((t, i) => {
            return t.map((tt) => {
                return tt * idf[i];
            })
        })

    }

    public myMagnitude(query: string[], documents: string[]) {
        /*
        * [[], [], [], []] each array represents each word in query
        *  and each [] array represents each document
        *  and each element in [] array represents tf-idf score
        * */
        const tfIDF = this.myTFIDF(query, documents);
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
        const docsMagnitude = docs.map((doc) => {
            let sum = 0;
            doc.map((d: number) => {
                console.log(d)
                sum += Math.pow(d, 2);
            })
            console.log(sum)
            console.log("----------------------------------")
            return Math.sqrt(sum);
        });
        // const idf = this.myIDF(query, documents);
        // const queryMagnitude = query.map((q, i) => {
        //     query.map((qq) => {
        //
        //     })
        // });
        console.log(docsMagnitude )
    }


    public mySearch(query: string) {
        const words = query.split(" ");
        const outPath = path.join(__dirname, "../test");
        const files = fs.readdirSync(outPath);
        let documents: string | any = [];
        let log:any = [];
        const result = files.map((file: any) => {
            if (file.startsWith('Document')){
                const data = fs.readFileSync(path.join(outPath, file), "utf8");
                log.push(file);
                documents.push(data);
            }
        });
        const wordsList: any[] = [];
        documents.map((doc:any)=> {
            const words = doc.split(" ");
            words.map((word: string) => {
                if (!wordsList.includes(word)) {
                    wordsList.push(word);
                }
            })
        })
        console.log(log)
        const tf = this.myMagnitude(query.split(" "), documents);
        // console.log("tf: ", tf);
    }

}


/*
* public TF() {
        return this.allWords.map((allWord) => {
            let doc: any[] = [];
            this.documentsWords.map((words) => {
                let tf = 0;
                const wordsArr = words.split(" ");
                wordsArr.map((word) => {
                    if (word == allWord) {
                        console.log(word)
                        tf++;
                    }
                })
                doc.push(tf);
            })
            return doc;
        })
    }

    public DF() {
        this.allWords.map((q) => {
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
        // console.log("Document length: ",this.documentsWords.length)
        // return this.queryWords.map((q) => {
        //     console.log(this.documentsWords.length," / ",this.DF()," = ", this.documentsWords.length / this.DF() , " ~ ", (Math.log(this.documentsWords.length / this.DF()) /  Math.log(10)).toFixed(4))
        //     return parseFloat((Math.log(this.documentsWords.length / this.DF()) / Math.log(10)).toFixed(4));
        // })
    }

    public TFIDF() {
        // const tf = this.TF(); // [[], [], [], []] each array represents each word in query
        // const idf = this.IDF(); // [] each element represents each word in query
        //
        // return tf.map((t, i) => {
        //     return t.map((tt) => {
        //         return tt * idf[i];
        //     })
        // })

    }
    *
    *
    *
    *
    *
    *
    *
    *
    *
    *
    *
    *
    *     public async Magnitude() {
        /*
        * [[], [], [], []] each array represents each word in query
        *  and each [] array represents each document
        *  and each element in [] array represents tf-idf score
        *
const tfIDF = JSON.parse(await client.get('vectorData') ?? "[]");
let docs: any[] = [];
tfIDF.map((words: any, ind: any) => {
    words.map((doc: any, index: number) => {
        if (docs[index]?.length > 0) {
            docs[index] = [...docs[index], doc]
        } else {
            docs[index] = [doc]
        }
    })
});
const docsMagnitude = docs.map((doc) => {
    let sum = 0;
    doc.map((d: number) => {
        console.log(d)
        sum += Math.pow(d, 2);
    })
    console.log(sum)
    console.log("----------------------------------")
    return Math.sqrt(sum);
});
// const idf = this.myIDF(query, documents);
// const queryMagnitude = query.map((q, i) => {
//     query.map((qq) => {
//
//     })
// });
console.log(docsMagnitude)
}

*
* */