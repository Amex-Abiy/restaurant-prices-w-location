const requestPromise = require('request-promise');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const loadCSV = require('./load-csv');
const RestaurantsScrapper = require('./restaurants-scrapper')
const KNN = require('./knn/knn')
const LinearRegression = require('./linear-regression/linear-regression')


const { features, labels, testFeatures, testLabels } = loadCSV('./scrappedData/data.csv', {
    shuffle: true,
    splitTest: 18,
    dataColumns: ['lat', 'long'],
    labelColumns: ['price']
})

const knn = new KNN(features, labels, 2)
const result = knn.knnCustom([9.031204, 38.753092]);
console.log(result)
let x = 0;
// testFeatures.forEach((testPoint, i) => {
//     console.log('TEST POINT -> ', testPoint)
//     const result = knn.knnCustom(testPoint);
//     console.log(typeof(result))
//     const error = ((testLabels[i][0] - result) / testLabels[i][0]) * 100
//     x += Math.abs(error)
//     console.log('Error(%) - ', error)
//     console.log('Guesss => ', result, (testLabels[i][0]));
// });
// console.log('AVERAGE INACCURACY = ', x / 18)










// const { features, labels, testFeatures, testLabels } = loadCSV('./scrappedData/data.csv', {
//     shuffle: true,
//     splitTest: 30,
//     dataColumns: ['long', 'lat'],
//     labelColumns: ['price']
// })

// const regression = new LinearRegression(features, labels, { learningRate: 0.5, iterations: 100, batchSize: 65 });
// regression.features.print()
// regression.train();
// regression.test(testFeatures, testLabels);




// const restaurants = 'https://deliveraddis.com/restaurants';
// const restaurantDetails = 'https://deliveraddis.com/restaurants/';

// restaurantsScrapper = new RestaurantsScrapper(restaurants, restaurantDetails);
// restaurantsScrapper.scrapeListOfRestaurants();
// restaurantsScrapper.scrapeRestaurantsDetails();
// restaurantsScrapper.createCSV()
// knn = new KNN();
// console.log(knn.calculateDistance([9.023486, 38.810492], [8.992731514675485, 38.72422635555267]))