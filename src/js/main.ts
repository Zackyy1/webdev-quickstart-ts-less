module MyModule {
    export const Init = () => {
        console.log('Hello world!');
    }
}


$(document).ready( () => {
    MyModule.Init();

})
