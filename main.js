/* 
Get the product out there. Move fast. Make the MVP as quick as possible.
Remember your commitment to your missions. Keep typing.
*/

const natural = require("natural");
const neataptic = require("neataptic");

const exampledata = [ // a list of classes of documents
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

/* uses extracted data from a data structure that looks like so:

const extractedData = [ // a list of classes and their documents
    {
        "class": "hungry", // a class of documents
        "documents": ["food", "eat"] // a list of documents
    },
    {
        "class": "sleepy",
        "documents": ["bed", "tired"]
    }
];

returns a new JSON object of data to be trained
*/
let wrangleData = (extractedData) => {
    let processedData = {
        "vocabulary": [], // tokenized and stemmed list of all words in the dataset
        "documents": [], // each element is an array of the tokenized words in a single document
        "classes": [], // categories
        "bags": [],// bags of words for each document
        "trainingset": [] // input-output pairs for the neataptic neural network
    };

    // process each document in the list
    extractedData.forEach((category) => {
        category.documents.forEach((document) => {
            // tokenize each word in the document
            let tokenizedWords = tokenizeDocument(document);
            // add each word to the list of words
            tokenizedWords.forEach(i => processedData.vocabulary.push(i));
            // add each document to the list of documents
            processedData.documents.push(tokenizedWords);
        });
        // add each class to the list of classes. we know that there's no duplicates
        processedData.classes.push(category.class);
    });

    // stem each word (also lowercases each word)
    processedData.vocabulary = processedData.vocabulary.map(word => stemSingleWord(word));

    // remove duplicates
    processedData.vocabulary = Array.from(new Set(processedData.vocabulary));

    // create a bag of words vector for each document
    processedData.documents.forEach((document) => {
        // create an individual bag of words vector and add it
        processedData.bags.push(makeBagOfWords(document, processedData.vocabulary));
    });

    // create JSON objects of each input-output pair for the training set

    // first, create one-hot encodings for the categories
    let outputs = [];
    for (let i = 0; i < processedData.classes.length; i++) {
        // create an empty array of zeros the length of the number of categories to act as a template
        let output_row = new Array(processedData.classes.length).fill(0);
        output_row[i] = 1;
        outputs.push(output_row);
    }

    // then add the input-output pairs
    extractedData.forEach((category, classIndex) => {
        category.documents.forEach((document) => {
            processedData.trainingset.push({ "input": cleanSentence(document, processedData.vocabulary), "output": outputs[classIndex] });
        });
    });

    // return the new JSON object
    return processedData;
};

/////////////////////////////////////////////////////
// keep going
/////////////////////////////////////////////////////

const dataset = wrangleData(exampledata);

// create a perceptron neural network with input sizes of the size of the bag of words vectors, output sizes of
// the number of categories/classes, and a hidden layer the size of the sum of the input and output sizes
let NN = neataptic.architect.Perceptron(dataset.bags[0].length, dataset.bags[0].length + dataset.classes.length, dataset.classes.length);

NN.train(dataset.trainingset, {
    log: 10,
    iterations: 100000
});

const intent1 = NN.activate(cleanSentence("let's eat food food", dataset.vocabulary));
const intent2 = NN.activate(cleanSentence("go to bed baka", dataset.vocabulary));
const intent3 = NN.activate(cleanSentence("neither", dataset.vocabulary));