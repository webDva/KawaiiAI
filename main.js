const natural = require("natural");
const neataptic = require("neataptic");

const categories = [ // a list of classes of documents
    {
        "class": "hungry", // a class of documents
        "documents": // a list of documents
            [
                "I'm hungry!", // a single document
                "I want to eat!",
                "Feed me, baka!",
                "What's for dinner?"
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
let documents = []; // each element in documents is an array of the tokenized words in a single document
let classes = [];

// processing each document

// first tokenize each word in the document
let tokenizer = new natural.TreebankWordTokenizer();
categories.forEach((category) => {
    category.documents.forEach((sentence) => {
        let tokenizedWords = tokenizer.tokenize(sentence);
        // add each word to the list of words
        tokenizedWords.forEach(i => words.push(i));
        // add each document to the list of documents
        documents.push(tokenizedWords);
    });
    // add each class to the list of classes. we know that there's no duplicates
    classes.push(category.class);
});

// now stem and lower each word and remove duplicates

// stem each word (also lowercases each word)
words = words.map(word => natural.LancasterStemmer.stem(word));

// remove duplicates
words = Array.from(new Set(words));

// create a bag of words for each document/sentence

let bags = []; // dataset

documents.forEach((document) => {
    let bag = []; // individual bag of words

    // stem each word
    document = document.map(word => natural.LancasterStemmer.stem(word));

    // create a single bag of words vector
    words.forEach((word) => {
        if (document.includes(word))
            bag.push(1);
        else
            bag.push(0);
    });

    // add the new bag of word to the list of bags that is the dataset
    bags.push(bag);
});

// create a one-hot encoding of the categories

let outputs = [] // a list of categories using one-hot encoding

for (let i = 0; i < classes.length; i++) {
    // create an empty array of zeros the length of the number of categories to act as a template
    let output_row = new Array(classes.length).fill(0);
    output_row[i] = 1;
    outputs.push(output_row);
}

// train a neural network on the dataset

let trainingSet = [];

// create a json object for each input-output pair
categories.forEach((category, classIndex) => {
    category.documents.forEach((document, documentIndex) => {
        let classification = {};
        classification.input = bags[documentIndex];
        classification.output = outputs[classIndex];
        trainingSet.push(classification); // add the new json object to the training set
    });
});