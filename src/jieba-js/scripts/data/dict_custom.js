_custom_dict = [
	["漫畫", 99999999, "n"],
    ["入金", 99999999, "n"],
    ["出金", 99999999, "n"],
    ["申請", 99999999, "n"],
    ["時間", 99999999, "n"],
    ["限制", 99999999, "n"],
    ["是否", 99999999, "n"],
    ["沒收到", 99999999, "n"],
    ["完成", 99999999, "n"],
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