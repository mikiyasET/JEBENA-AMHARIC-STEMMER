import {common_amh_abbr_list} from "../constants/abbr";

const {stop_word_list} = require("../constants/stopwords");
const {punctuation_list} = require("../constants/punctuation");
import path from "path";
import fs from "fs";
import {Vector} from "./vector";
import {DOCUMENT_FILES_PATH, INDEXED_FILES_PATH, REDIS_EXPIRE} from "../constants/constants";
import {myTrans} from "../constants/trans";

export class core {
    public query: string = "";
    private queryWords: string[] = [];

    private tfIDF: any[] = [];
    private qtfIDF: any[] = [];

    private documentsTFIDF: any[] = [];
    private filesList: string[] = [];

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
        const infixRemoved = this.removeInfix(prefixRemoved);

        return infixRemoved.replace(/\s\s+/g, ' ');
    }

    public searchTable(query: string) {
        const fidel = JSON.parse(fs.readFileSync(path.join(__dirname, "../constants/dic.json"), "utf8"));
        if (fidel[query]) {
            return fidel[query];
        }
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
        console.log(query)
        const removeSuffixes = ['wo$$$c$$$n', 'wo$$$c', 'o$$$c$$$n', 'o$$$c']
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

    public removeInfix(query: string) {
        // @ts-ignore
        if (/.+([^aeiou])[aeiou]\1[aeiou].?/i.test(query.replaceAll("$$$", "")) || /^(.+)a\1$/i.test(query.replaceAll("$$$", ""))) {
            // @ts-ignore
            query = query.replaceAll("$$$", "")
            if (/.+([^aeiou])[aeiou]\1[aeiou].?/i.test(query)) {
                query = query.replace(
                    /\S\S[^aeiou][aeiou]/i,
                    query[0] + query[1]
                )
            }
            else if (/^(.+)a\1$/i.test(query)) {
                query = query.replace(/a.+/i, "")
            }
            if (/[bcdfghjklmnpqrstvwxyz]{2}e/i.test(query)) {
                let ccv = query.match(/[bcdfghjklmnpqrstvwxyz]{2}e/i)!

                query = query.replace(
                    /[bcdfghjklmnpqrstvwxyz]{2}e/i,
                    ccv[0].substring(0, 1) + "X" + ccv[0].substring(1)
                )
            }
            query = this.swapEng(myTrans(query, "en"))
            return query
        } else {
            return query
        }
    }

    public indexer() {
        try {
            console.log("Indexing started ...")
            const dirPath = DOCUMENT_FILES_PATH;
            const outPath = INDEXED_FILES_PATH;
            let alreadyIndexed: string[] = [];
            const files = fs.readdirSync(outPath);
            const result = files.map((file: any) => {
                alreadyIndexed.push(file);
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
                            if (counter == fileSize) {
                                console.log("Indexing done.")
                            }
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

    public async magnitude() {
        let docs: any[] = [];
        this.tfIDF.map((words: any, ind: any) => {
            words.map((doc: any, index: any) => {
                if (docs[index]?.length > 0) {
                    docs[index] = [...docs[index], doc]
                } else {
                    docs[index] = [doc]
                }
            })
        });
        this.documentsTFIDF = docs;
        const magnitude = docs.map((doc) => {
            return Math.sqrt(doc.reduce((a: any, b: any) => a + b * b, 0));
        })
        const qMagnitude = Math.sqrt(this.qtfIDF.reduce((a: any, b: any) => a + b * b, 0));
        return {
            tfIDF_mnt: magnitude,
            qtfIDF_mnt: qMagnitude,
        };
    }

    public async dotProduct() {
        let arr: any[] = []
        this.qtfIDF.map((q, index) => {
            this.documentsTFIDF.map((doc, ind) => {
                if (q != 0 && doc[index] != 0) {
                    console.log("Document ", ind, ": ", q, doc[index])
                    if (arr[ind] == undefined) {
                        arr[ind] = (q * doc[index]);
                    } else {
                        arr[ind] += (q * doc[index]);
                    }
                }
            })
        })
        return arr;
    }

    public async cosineSimilarity() {
        const magnitude = await this.magnitude();
        const dotPro = await this.dotProduct();
        const magnitudeDoc = magnitude.tfIDF_mnt;

        // console.log("Magnitude: ", magnitude)
        // console.log("Dot Product: ", dotPro)

        return dotPro.map((val, index) => {
            return parseFloat((val / (magnitudeDoc[index] * magnitude.qtfIDF_mnt)).toFixed(4));
        })
    }

    public async Search() {
        this.queryWords = this.query.split(" ");
        const vector = new Vector();
        vector.uniqueProcess(this.queryWords);
        this.tfIDF = await vector.TFIDF();
        this.qtfIDF = vector.QTFIDF();
        this.filesList = vector.filesList;
        const store = {
            tfIDF: this.tfIDF,
            qtfIDF: this.qtfIDF,
            filesList: vector.filesList
        }
        const cosineSimilarity = await this.cosineSimilarity();
        let result: any[] = [];
        this.filesList.forEach((name, index) => {
            const doc_source = fs.readFileSync(DOCUMENT_FILES_PATH + "/" + name, "utf8");
            const doc_index = fs.readFileSync(INDEXED_FILES_PATH + "/" + name, "utf8");

            const contentWords = doc_index.split(/\s+/);
            const maxContextWords = 10;
            let highlightedContent = "";
            contentWords.map((word: string, wordIndex: number, arr: string[]) => {
                this.queryWords.map((q) => {
                    if (q == word) {
                        const startIndex = Math.max(wordIndex - maxContextWords, 0);
                        const endIndex = Math.min(wordIndex + maxContextWords + 1, arr.length);
                        highlightedContent = arr.slice(startIndex, endIndex).join(' ');
                    }
                })
            });
            result = [...result, {
                document: name,
                score: cosineSimilarity[index] ?? 0,
                indexPATH: INDEXED_FILES_PATH + "/" + name,
                path: DOCUMENT_FILES_PATH + "/" + name,
                indexed: doc_index,
                source: doc_source,
                highlightedContent: highlightedContent
            }]

        })
        result.sort((a: any, b: any) => b.score - a.score);
        result = result.filter((res) => res.score > 0);
        return result;
    }
}