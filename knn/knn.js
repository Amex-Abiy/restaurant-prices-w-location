require('@tensorflow/tfjs-node')
const tf = require('@tensorflow/tfjs');
const _ = require('lodash')

class KNN {
    constructor(features, labels, k) {
        this.features = features;
        this.labels = labels;
        this.k = k;
    }

    calculateDistance(coordinate1, coordinate2) {
        Number.prototype.toRad = function() {
            return this * Math.PI / 180;
        }

        var lat2 = coordinate2[0];
        var lon2 = coordinate2[1];
        var lat1 = coordinate1[0];
        var lon1 = coordinate1[1];

        var R = 6371; // km 
        //has a problem with the .toRad() method below.
        var x1 = lat2 - lat1;
        var dLat = x1.toRad();
        var x2 = lon2 - lon1;
        var dLon = x2.toRad();
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    knnCustom(predictionPoint) {
        const resultArray = [];
        for (let i = 0; i < this.features.length; i++) {
            resultArray.push([this.calculateDistance(this.features[i], predictionPoint)])
        }
        const coordinates = tf.tensor(resultArray)
        const prices = tf.tensor(this.labels);
        coordinates.concat(prices, 1).print()
        debugger;

        return coordinates.concat(prices, 1)
            .unstack()
            .sort((a, b) => a.arraySync()[0] > b.arraySync()[0] ? 1 : -1)
            .slice(0, this.k)
            .reduce((acc, pil) => acc + pil.arraySync()[1], 0) / this.k;
    }
}


module.exports = KNN;



// static knn(features, labels, predictionPoint, k) {
//     // const { mean, variance } = tf.moments(features, 0);
//     // const scaledPrediction = predictionPoint.sub(mean).div(variance.pow(0.5));
//     console.log(features.print())
//     console.log(features
//         .sub(mean)
//         .div(variance.pow(0.5))
//         .sub(scaledPrediction)
//         .pow(2)
//         .sum(1)
//         .pow(0.5)
//         .expandDims(1)
//         .concat(labels, 1)
//         .unstack()
//         .sort((a, b) => a.arraySync()[0] > b.arraySync()[0] ? 1 : -1)
//         .slice(0, k)
//         .reduce((acc, pil) => acc + pil.arraySync()[1], 0) / k)
//     return features
//         .sub(mean)
//         .div(variance.pow(0.5))
//         .sub(scaledPrediction)
//         .pow(2)
//         .sum(1)
//         .pow(0.5)
//         .expandDims(1)
//         .concat(labels, 1)
//         .unstack()
//         .sort((a, b) => a.arraySync()[0] > b.arraySync()[0] ? 1 : -1)
//         .slice(0, k)
//         .reduce((acc, pil) => acc + pil.arraySync()[1], 0) / k;
// }