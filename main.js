const natural = require("natural");

const categories = [ // a list of classes of documents
    {
        "class": "hungry", // a class of documents
        "documents": // a list of documents
            [
                "i'm hungry!", // a single document
                "i want to eat!",
                "feed me, baka!",
                "what's for dinner?"
            ]
    },
    {
        "class": "sleepy",
        "documents":
            [
                "i'm sleepy",
                "i'm tired",
                "i must rest"
            ]
    },
    {
        "class": "kawaii",
        "documents":
            [
                "i'm kawaii",
                "baka!",
                "pantsu"
            ]
    }
];

// organization of data structures
let words = [];
let documents = [];
let classes = [];

// processing each document

// first tokenize each word in the document
let tokenizer = new natural.TreebankWordTokenizer();
categories.forEach((category) => {
    category.documents.forEach((sentence) => {
        let w = tokenizer.tokenize(sentence);
        // add each word to the list of words
        w.forEach((i) => words.push(i));
        // add each document to the list of documents
        documents.push(sentence);
    });
    // add each class to the list of classes. we know that there's no duplicates
    classes.push(category.class);
});

// now stem and lower each word and remove duplicates
