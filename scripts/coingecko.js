function coingeckoCoinPrice(symbol) {
    var listKey = 'coingeckoPriceList'
    var runningKey = 'running_coingecko'
    var response = cache.get(listKey)

    while (cache.get(runningKey) && !response) {
        Utilities.sleep(2000)
    }

    if (!response) {
        cache.put(runningKey, true, 1)
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`
        response = UrlFetchApp.fetch(url, {
            "method": "get",
            "muteHttpExceptions": true
        }).getContentText()
        cache.put(listKey, response, 21600) //6 Hours
        cache.put(runningKey, false, 1)
    }
    try {
        var l = JSON.parse(response) || []
    } catch {
        console.log('coingeckoCoinPrice Error ' + response)
        console.log(response)
        cache.remove(listKey)
        return 0
    }
    var price = 0
    for (i of l) {
        if (i.symbol.toLowerCase() === symbol.toLowerCase()) {
            price = i.current_price
            break;
        }
    }


    return price;
}
