function krakenCoinPrice(symbol) {
    var listKey = `krakenPriceList_${symbol}`
    var runningKey = 'running_kraken'
    var response = cache.get(listKey)


    while (cache.get(runningKey) && !response) {
        Utilities.sleep(500);
    }

    if (!response) {
        cache.put(runningKey, true, 1);
        const url = `https://api.kraken.com/0/public/Ticker?pair=${symbol.toLowerCase()}usd`

        response = UrlFetchApp.fetch(url, {
            "method": "get",
            "muteHttpExceptions": true,
        }).getContentText();

        cache.put(listKey, response, 21600); //6 Hours
        cache.put(runningKey, false, 1);
    }
    var l = JSON.parse(response);
    if (!l || !l.result) {
        cache.remove(listKey)
        return 0;
    }
    var k = Object.keys(l.result)[0]
    try {
        var p = parseFloat(l.result[k].a[0])
    } catch {
        console.log('krakenCoinPrice Error ' + response)
        cache.remove(listKey)
        return 0
    }
    return p;
}


function krakenPrivate(endpoint, parameters) {
    Utilities.sleep(Math.random() * 100)

    key = keysSheet.getRange('B4').getValue()
    if (!key || key == 'test') {
        return {}
    }
    api_secret = Utilities.base64Decode(keysSheet.getRange('C4').getValue())
    api_path = Utilities.newBlob('/0/private/' + endpoint).getBytes()
    api_nonce = Date.now().toString()
    api_post = 'nonce=' + api_nonce + '&' + parameters

    api_sha256 = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, api_nonce + api_post)
    api_hmac = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_512, api_path.concat(api_sha256), api_secret)
    api_signature = Utilities.base64Encode(api_hmac)

    http_options = {'method': 'post', 'payload': api_post, 'headers': {'API-Key': key, 'API-Sign': api_signature}}
    http_response = UrlFetchApp.fetch('https://api.kraken.com/0/private/' + endpoint, http_options)
    api_data = http_response.getContentText()
    return api_data
}

function krakenAssets() {
    var listKey = `krakenAssets`;
    var response = cache.get(listKey);
    if (!response) {
        response = krakenPrivate('BalanceEx', '')
        cache.put(listKey, response, 21600); //6 Hours
    }
    var l = JSON.parse(response)
    var assets = {}
    for (k in l['result']) {
        assets[k] = parseFloat(l['result'][k]['balance'])
    }
    if (!l) {
        console.log(response)
        cache.remove(listKey)
        throw new Error('Kraken Error: ' + response)
    }
    var rx = /(\.S$|\.HOLD$)/ig, rx1 = /^X(.{3,})$/ig
    for (k in assets) {
        if (!k.match(rx) && !k.match(rx1)) {
            continue
        }
        nk = k.replaceAll(rx, '').replace(rx1, '$1')

        assets[nk] = assets[nk] || 0
        assets[nk] += assets[k]
        delete assets[k]
    }
    // console.log(assets)
    return removeZeros(assets)
}

