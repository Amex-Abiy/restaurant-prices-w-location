const tf = require('@tensorflow/tfjs');
const _ = require('lodash')

class LinearRegression {
    constructor(features, labels, options) {
        this.features = this.processFeatures(features);
        this.labels = tf.tensor(labels);
        this.options = Object.assign({ learningRate: 0.1, iterations: 1000 }, options);

        this.weights = tf.zeros([this.features.shape[1], 1])
        this.MSEHistory = [];
    }

    /* from y = mx + b, let y -> MPG, x -> horsePower
       therefore, MPG = m * horsePower + b   */

    train() {
        const batchQuantity = Math.floor(this.features.shape[0] / this.options.batchSize);
        for (let i = 0; i < this.options.iterations; i++) {
            for (let j = 0; j < batchQuantity; j++) {
                const startIndex = j * this.options.batchSize;
                const featureSlice = this.features.slice([startIndex, 0], [this.options.batchSize, -1]);
                const labelSlice = this.labels.slice([startIndex, 0], [this.options.batchSize, -1]);
                this.gradientDescent(featureSlice, labelSlice);
            }
            // console.log('this.options.learningRate => ', this.options.learningRate)
            this.recordMSE();
            this.updateLearningRate();
        }
    }

    gradientDescent(features, labels) {
        const currentGuess = features.matMul(this.weights)
        const differences = currentGuess.sub(labels)
        const slopes = features.transpose().matMul(differences).div(features.shape[0])

        this.weights = this.weights.sub(slopes.mul(this.options.learningRate))
    }

    predict(observation) {
        return this.processFeatures(observation).matMul(this.weights)
    }

    test(testFeatures, testLabels) {
        testFeatures = this.processFeatures(testFeatures);
        testLabels = tf.tensor(testLabels);

        const predictions = testFeatures.matMul(this.weights);
        predictions.print();
        const SStot = testLabels.sub(testLabels.mean()).pow(2).sum().arraySync()
        const SSres = testLabels.sub(predictions).pow(2).sum().arraySync()
        const R = 1 - (SSres / SStot)

        console.log('SSres => ', SSres, ', SStot => ', SStot, ', R =>', R);
    }

    processFeatures(features) {
        features = tf.tensor(features);

        if (this.mean && this.variance) {
            features = features.sub(this.mean).div(this.variance.pow(0.5));
        } else {
            features = this.standardize(features)
        }
        features = tf.ones([features.shape[0], 1]).concat(features, 1);
        return features;
    }

    standardize(features) {
        const { mean, variance } = tf.moments(features, 0);

        this.mean = mean;
        this.variance = variance;
        // this.mean.print()
        // this.variance.print()
        // features.print()
        // features.sub(mean).print()
        return features.sub(mean).div(variance.pow(0.5));
    }

    recordMSE() {
        const mse = this.features.matMul(this.weights)
            .sub(this.labels)
            .pow(2)
            .sum()
            .div(this.features.shape[0])
            .arraySync()

        // unshift adds new elements at front
        this.MSEHistory.unshift(mse)
    }

    updateLearningRate() {
        if (this.MSEHistory.length < 2) {
            return;
        }
        // mse goes up
        if (this.MSEHistory[0] > this.MSEHistory[1]) {
            this.options.learningRate = this.options.learningRate / 2;
            // mse goes up
        } else {
            this.options.learningRate = this.options.learningRate * 1.05;
        }
    }
}

module.exports = LinearRegression;


//  AN UNOPTIMIZED METHOD OF HANDLING GRADIENT DESCENT

// constructor(features, labels, options) {
//     this.features = features;
//     this.labels = labels;
//     this.options = Object.assign({ learningRate: 0.1, iterations: 1000 }, options);

//     this.m = 0;
//     this.b = 0;
// }
/* from y = mx + b, let y -> MPG, x -> horsePower
   therefore, MPG = m * horsePower + b   */
// train() {
//     for (let i = 0; i < this.options.iterations; i++) {
//         this.gradientDescent();
//     }
// }

// gradientDescent() {
//     // calculating the 'mx + b' part
//     const currGuessForMPG = this.features.map((row) => {
//         return this.m * row[0] + this.b;
//     })

//     // calculating ths slope with respect to b for MSE, i.e, d(MSE)/db
//     const bSlope = (_.sum(currGuessForMPG.map((guess, i) => {
//         return guess - this.labels[i][0]
//     })) * 2) / this.labels.length

//     // calculating ths slope with respect to m for MSE, i.e, d(MSE)/dm
//     const mSlope = (_.sum(currGuessForMPG.map((guess, i) => {
//         return -1 * this.features[i][0] * (this.labels[i][0] - guess)
//     })) * 2) / this.labels.length;

//     this.b = this.b - (bSlope * this.options.learningRate)
//     this.m = this.m - (mSlope * this.options.learningRate)
// }