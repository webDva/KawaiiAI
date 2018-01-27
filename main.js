/* 
Get the product out there. Move fast. Make the MVP as quick as possible.
Remember your commitment to your missions.
*/

const natural = require("natural");
const neataptic = require("neataptic");

const categories = [ // a list of classes of documents
    {
        "class": "hungry", // a class of documents
        "documents": // a list of documents
            [
                "food" // a single document
            ]
    },
    {
        "class": "sleepy",
        "documents":
            [
                "bed"
            ]
    }
];

/////////////////////////////////////////////////////
// Utility helper functions
/////////////////////////////////////////////////////

// tokenizer function. returns an array of strings
const tokenizeDocument = (document) => {
    const naturalTokenizer = new natural.TreebankWordTokenizer();
    return naturalTokenizer.tokenize(document);
};

// stems a word (and lowercases it too). returns a string
const stemSingleWord = (word) => {
    return natural.LancasterStemmer.stem(word);
};

// returns a single bag of words vector using a document and its vocabulary superset
// document is a tokenized and stemmed sentence
const makeBagOfWords = (document, vocabulary) => {
    let bag = [];
    vocabulary.forEach((word) => {
        if (document.includes(word))
            bag.push(1);
        else
            bag.push(0);
    });
    return bag;
};

// makes a bag of words vector for a sentence
const cleanSentence = (sentence, wordList) => {
    // tokenize the sentence
    sentence = tokenizeDocument(sentence);

    // stem each word
    sentence = sentence.map(word => stemSingleWord(word));

    // remove duplicate words
    sentence = Array.from(new Set(sentence));

    // create a single bag of words vector
    const bag = makeBagOfWords(sentence, wordList);

    return bag;
};

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

// organization of data structures
let words = [];
let documents = []; // each element in documents is an array of the tokenized words in a single document
let classes = [];

// processing each document

categories.forEach((category) => {
    category.documents.forEach((sentence) => {
        // tokenize each word in the document
        let tokenizedWords = tokenizeDocument(sentence);
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
words = words.map(word => stemSingleWord(word));

// remove duplicates
words = Array.from(new Set(words));

// create a bag of words for each document/sentence

let bags = []; // dataset

documents.forEach((document) => {
    // stem each word
    document = document.map(word => stemSingleWord(word));

    // create an individual bag of words vector
    const bag = makeBagOfWords(document, words);

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
    category.documents.forEach((document) => {
        // add a new json object to the training set
        trainingSet.push({ "input": cleanSentence(document, words), "output": outputs[classIndex] });
    });
});

let NN = neataptic.architect.Perceptron(bags[0].length, bags[0].length + classes.length, classes.length);

NN.train(trainingSet, {
    log: 10,
    iterations: 100000
});

const intent1 = NN.activate(cleanSentence("food food", words));
const intent2 = NN.activate(cleanSentence("bed", words));
const intent3 = NN.activate(cleanSentence("neither", words));