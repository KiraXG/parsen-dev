// ‌1. TypeScript不认识.vue文件类型‌：TypeScript默认不认识.vue文件，因此需要定义相应的声明文件。
// 2. ‌文件开头有注释‌：如果.vue文件开头有注释，可能会导致TypeScript无法正确解析文件，从而报错。

// 这段代码告诉TypeScript，遇到以.vue结尾的模块导入时，将其视为一个模块整体，而不是一个文件‌
declare module '*.vue' {
    import { ComponentOptions } from 'vue'
    const componentOptions: ComponentOptions
    export default componentOptions
}
