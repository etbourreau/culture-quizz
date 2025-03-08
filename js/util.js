Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
}

clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
}

const isNil = function (value) {
    return value === null || value === undefined;
}

const getStorage = function (key, defaultValue) {
    const value = localStorage.getItem(key);
    return isNil(value) ? defaultValue : JSON.parse(value);
}

const setStorage = function (key, value) {
    if (isNil(value)) {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

/**
 * Return a random value (from array, from 0 to number or from 0 to 1)
 * @param val Array|Number|Null
 * @returns 
 */
const random = function (val) {
    if (Array.isArray(val)) {
        return val[Math.floor(Math.random() * val.length)];
    } else if (typeof val === "number") {
        return Math.floor(Math.random() * (val + 1));
    } else {
        return Math.random();
    }
}

const reduce = function (arr, callback, initialValue) {
    let accumulator = initialValue;
    arr.forEach((el, i) => {
        accumulator = callback(accumulator, el, i, arr);

    });
    return accumulator;
}

const now = function () {
    return new Date().getTime();
}

const map = function (value, minSource, maxSource, minTarget, maxTarget) {
    return (value - minSource) * (maxTarget - minTarget) / (maxSource - minSource) + minTarget;
}

const wait = async (ms) => {
    return new Promise(r => {
        setTimeout(r, ms)
    })
}

const playSound = (sound) => {
    if (sound) {
        sound.pause();
        sound.currentTime = 0;
        sound.play();
    }
}