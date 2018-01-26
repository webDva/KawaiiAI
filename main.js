const Lexed = require("lexed").Lexed;

const categories = [ // a list of classes of documents
    {
        "class": "hungry", // a class of documents
        "documents": // a list of documents
            [
                "im hungry", // a single document
                "i want to eat",
                "feed me baka",
                "whats for dinner"
            ]
    },
    {
        "class": "sleepy",
        "documents":
            [
                "im sleepy",
                "im tired",
                "i must rest"
            ]
    },
    {
        "class": "kawaii",
        "documents":
            [
                "im kawaii",
                "baka",
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
categories.forEach((category) => {
    category.documents.forEach((sentence) => {
        let w = new Lexed(sentence).lexer().tokens; // a list of a list of words (yes, two lists)
        // add each word to the list of words
        w[0].forEach((i) => words.push(i));
    });
});