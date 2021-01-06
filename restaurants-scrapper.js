const requestPromise = require('request-promise');
const request = require('request');
const cheerio = require('cheerio');
const { Parser } = require('json2csv')
const fs = require('fs')

class RestaurantsScrapper {
    constructor(restaurants, restaurantDetails) {
        this.restaurants = restaurants;
        this.restaurantDetails = restaurantDetails;

        this.restaurantArray = []
        this.restaurantDetailsArray = []
        this.errorLog = []
    }

    async scrapeListOfRestaurants() {
        const response = await requestPromise({
            uri: this.restaurants,
            headers: {
                'cf-cache-status': 'DYNAMIC',
                'cf-ray': '5cd5f3e60b3be938-MRS',
                'cf-request-id': '04f996c3c10000e938c3040200000001',
                'content-encoding': 'br',
                'content-type': 'text/html',
                'request-context': 'appId=cid-v1:ee01cb43-becd-4518-b3f4-c271f5d0c136',
                'server': 'cloudflare',
                'status': '200',
                'vary': 'Accept-Encoding',
                'x-content-type-options': 'nosniff',
                'x-powered-by': 'ASP.NET',

            },
        });
        let $ = cheerio.load(response)

        $('body > div.pusher > div.ui.grid.container.stackable.page-content.restaurant-list.lato > div.thirteen.wide.column > div.ui.divided.items > div')
            .each((index, elm) => {
                this.restaurantArray.push($(`body > div.pusher > div.ui.grid.container.stackable.page-content.restaurant-list.lato > div.thirteen.wide.column > div.ui.divided.items > div:nth-child(${index + 1}) > div > a`).attr('href').split('/restaurants/')[1])
            })
        this.scrapeRestaurantsDetails(this.restaurantArray)
    }

    async scrapeRestaurantsDetails() {
        for (let index in this.restaurantArray) {
            const details = [];
            const location = [];
            await requestPromise({
                uri: `${this.restaurantDetails}/${this.restaurantArray[index]}`,
                headers: {
                    'cf-cache-status': 'DYNAMIC',
                    'cf-ray': '5cd5f3e60b3be938-MRS',
                    'cf-request-id': '04f996c3c10000e938c3040200000001',
                    'content-encoding': 'br',
                    'content-type': 'text/html',
                    'request-context': 'appId=cid-v1:ee01cb43-becd-4518-b3f4-c271f5d0c136',
                    'server': 'cloudflare',
                    'status': '200',
                    'vary': 'Accept-Encoding',
                    'x-content-type-options': 'nosniff',
                    'x-powered-by': 'ASP.NET',

                },
            }).then((response) => {
                let $ = cheerio.load(response)
                const location = $('body > div.pusher.restaurant-menu > a').attr('href').split('q=loc:')[1].split(',')
                console.log('location =>', location)
                $('#menu-list > div').each((index, elm) => {
                    details.push({
                        name: $(`#menu-list > div:nth-child(${index + 2}) > div.twelve.wide.computer.ten.wide.mobile.column > h4`).text().trim(),
                        price: $(`#menu-list > div:nth-child(${index + 2}) > div.two.wide.computer.three.wide.mobile.column.amount > span.price`).text().trim()
                    })
                })
                console.log('detailsD', details)
                this.restaurantDetailsArray.push({ restaurant: this.restaurantArray[index], long: location[0], lat: location[1], details })
            }).catch((error) => {
                this.errorLog.push({ restaurant: this.restaurantArray[index], error: error.toString() })
            });
        }

        fs.writeFileSync(`./scrappedData/data.json`, JSON.stringify(this.restaurantDetailsArray), 'utf-8');
        fs.writeFileSync(`./scrappedData/error.json`, JSON.stringify(this.errorLog), 'utf-8');
    }

    createCSV() {
        var jsonData = require('./scrappedData/data.json');
        let dataForCSV = []
        for (let json in jsonData) {
            let prices = [];
            for (let detail in jsonData[json].details) {
                if (jsonData[json].details[detail].price) {
                    prices.push(parseInt(jsonData[json].details[detail].price))
                }
                continue;
            }
            const averagePrice = this.calculateAveragePrice(prices)
            dataForCSV.push({ restaurant: jsonData[json].restaurant, average_price: averagePrice, long: parseFloat(jsonData[json].location[0]), lat: parseFloat(jsonData[json].location[1]) })
        }
        console.log(dataForCSV)

        const fields = ['restaurant', 'long', 'lat', 'average_price']
        const parser = new Parser({ fields });
        const csv = parser.parse(dataForCSV)
        fs.writeFileSync(`./scrappedData/data.csv`, csv, 'utf-8');
    }

    calculateAveragePrice(prices) {
        let sum = prices.reduce((total, curr) => total + curr);
        return sum / prices.length;
    }
}

module.exports = RestaurantsScrapper;