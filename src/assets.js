const assets = {};
function loadAssets(assetBundle, onFinish) {
    var assetsLoaded = 0;
    function onAssetLoad() {
        assetsLoaded++;
        console.log(assetsLoaded);

        if (assetsLoaded === assetBundle.length) {
            console.log('goode :)')
            onFinish();
        }
    }

    for (var i = 0; i < assetBundle.length; i++) {
        var assetPack = assetBundle[i]; // ['name', Type, 'src']

        assets[assetPack[0]] = new assetPack[1];
        assets[assetPack[0]].onload = onAssetLoad();

        assets[assetPack[0]].src = assetPack[2];
    }
}

function playSound(name) {
    if (!assets[name].paused) {
        assets[name].currentTime = 0; // fix for mobile ??
    }
    assets[name].play();
}