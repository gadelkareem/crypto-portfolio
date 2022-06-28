function guardaAssets() {
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Crypto: Guarda"),
        rows = ss.getDataRange().getNumRows(),
        l = ss.getRange(2, 1, rows, 3).getValues()

    var assets = {}
    for (a of l) {
        a[0] = a[0].toUpperCase()
        if (!a[0]) continue
        assets[a[0]] = assets[a[0]] || 0
        assets[a[0]] += a[2]
    }

    return removeZeros(assets)
}
