import AMapLoader from '@amap/amap-jsapi-loader'
;(window as any)._AMapSecurityConfig = {
    securityJsCode: '535f73f17b632653974ce7e5af37947e'
}

const gdMap = AMapLoader.load({
    key: 'f950a5ed7d3503bb722c9383ea2bcb61', // 申请好的Web端开发者Key，首次调用 load 时必填
    version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [
        'AMap.Scale',
        'AMap.Geocoder',
        'AMap.Polyline',
        'AMap.Bounds',
        'AMap.Icon',
        'AMap.ToolBar',
        'AMap.ControlBar'
    ] //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
})

export default gdMap
