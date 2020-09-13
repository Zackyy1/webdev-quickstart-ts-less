var MyModule;
(function (MyModule) {
    MyModule.Init = function () {
        console.log('Hello world!');
    };
})(MyModule || (MyModule = {}));
$(document).ready(function () {
    MyModule.Init();
});
