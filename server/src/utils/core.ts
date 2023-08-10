const {stop_word_list} = require("../constants/stopwords");
const {punctuation_list} = require("../constants/punctuation");
const fs = require("fs");
const path = require("path");

export class core {

    // private stopWord: string[] = [
    //     "new","neber","aydelem","ena","keza","lay","belay","kelay","demo","wstt","bewstt","lewstt","awo","ay","ney","na","betam","bcha","liela","ezi","wedezi","slezi",
    //     "bihon","sle","alew","alat","enie","eswa","esu","enesu","erasu","berasu","lenersu","kenesu","benesu","yeesua","yeesu","yenesu","bzat","bebzat","endet","degmo",
    //     "liela","lielam", "yetu","yetua","yetochu","yhie","yeha","yegna","yenesu","bedemb","wstt","wcchi","eske","bemehal","bedar","entn","entna","nech","bzu","tinish",
    // ]
    public swapEng(query: string) {
        // roor dir >> constants >> fidel.json
        const fidels = JSON.parse(fs.readFileSync(path.join(__dirname, "../../constants/fidel.json"), "utf8"));
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
        const fidels = JSON.parse(fs.readFileSync(path.join(__dirname, "../../constants/fidel.json"), "utf8"));
        const words = query.split(" ");
        const result = words.map((word) => {
            const char = word.split("$$$");
            const chars = char.map((c) => {
                for(var i in fidels){
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
        query = this.punctuationRemover(query);
        const queries: string[] = this.stopWordRemover(query);
        const qs = queries.map((q: string) => {
            const table = this.searchTable(q);
            if (table) {
               return table;
            }
            else{
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
    public punctuationRemover(query: string) : string {
        const chars = query.split("");
        let result = chars.map((char) => {
            if (!punctuation_list.includes(char)) {
                return char;
            }
        });
        return result.join("");
    }
    public stopWordRemover(query: string) : string[] {
        const words = query.split(" ");
        let result = words.map((word) => {
            if (!stop_word_list.includes(word)) {
                return word;
            }
        });
        result = result.filter(e => e != undefined)
        console.log("Removed: ", result)
        return result as string[];
    }
    public remover(query: string) {
        const suffixRemoved = this.removeSuffix(query);
        const prefixRemoved = this.removePrefix(suffixRemoved);

        return prefixRemoved.replace(/\s\s+/g, ' ');
    }
    public searchTable(query: string) {
        const fidel = JSON.parse(fs.readFileSync(path.join(__dirname, "../../constants/dic.json"), "utf8"));
        if (fidel[query]) {
            return fidel[query];
        }
    }

    public removePrefix(query: string){
        const removePrefixes = ['ye','be','s$$$le','s$$$ne']
        if (query.replace('$$$','').length >= 5) {
            for (const prefix in removePrefixes) {
                if (query.trim().startsWith(removePrefixes[prefix])) {
                    console.log("Found: ", removePrefixes[prefix] , " in ", query)
                    query = query.substring(removePrefixes[prefix].length)
                    console.log("Changed: ", query)
                    break;
                }
            }
            return query;
        }
        return query;
    }
    public removeSuffix(query: string) {
        const removeSuffixes = ['wo$$$ch$$$n','wo$$$ch','o$$$ch$$$n','o$$$ch']
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
}