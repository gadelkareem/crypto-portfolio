function coinMarketCapCoinPrice(symbol) {
    var listKey = `coinMarketCapPriceList_${symbol}`
    var runningKey = 'running_coinMarketCap'
    var response = cache.get(listKey)
    var key = keysSheet.getRange('B2').getValue()

    while (cache.get(runningKey) && !response) {
        Utilities.sleep(500);
    }

    if (!response) {
        cache.put(runningKey, true, 1);
        const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=USD`

        const headers = {
            "X-CMC_PRO_API_KEY": key

        };

        response = UrlFetchApp.fetch(url, {
            "method": "get",
            "muteHttpExceptions": true,
            "headers": headers
        }).getContentText();

        cache.put(listKey, response, 21600); //6 Hours
        cache.put(runningKey, false, 1);
    }
    try {
        var l = JSON.parse(response) || []
    } catch {
        console.log('coinMarketCapCoinPrice Error ' + response)
        console.log(response)
        cache.remove(listKey)
        return 0
    }
    if (!l || !l.data || !l.data[symbol]) {
        cache.remove(listKey)
        console.log('CoinMarketCap Error: ' + response)
        return 0;
    }


    return l.data[symbol].quote.USD.price;
}


