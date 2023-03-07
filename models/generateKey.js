function generateKey(mask) {
    let key = "";
    let charactersLower = "abcdefghijklmnopqrstuvwxyz";
    let charactersUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < mask.length; i++) {
        if (mask[i] === "X") {
            key += charactersUpper.charAt(Math.floor(Math.random() * charactersLower.length));
        } else if (mask[i] === "x") {
            key += charactersLower.charAt(Math.floor(Math.random() * charactersUpper.length));
        } else {
            key += mask[i];
        }
    }
    return key;
}

exports.generateKey = generateKey