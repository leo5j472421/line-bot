_custom_dict = [
	["漫畫", 99999999, "n"],
    ["入金", 99999999, "n"],
    ["沒收到", 99999999, "n"],
    ["為什麼", 99999999, "n"],
];

// 引用設定檔案，以下不用變更
if (typeof(define) === "function") {
    define(function (require) {
        return _custom_dict;
    });
}
else {
    module.exports = _custom_dict;
}