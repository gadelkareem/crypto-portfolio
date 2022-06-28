function nexoAssets() {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Crypto: Nexo"),
        rows = ss.getDataRange().getNumRows(),
        l = ss.getRange(2, 1, rows, 2).getValues()

    var assets = {}
    for (a of l) {
        a[0] = a[0].toUpperCase()
        if (!a[0]) continue
        assets[a[0]] = assets[a[0]] || 0
        assets[a[0]] += a[1]
    }

    return removeZeros(assets)
}
