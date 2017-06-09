# Continue-for-one-second
_天若有情天亦老，我为element续一秒_
# 用法
在你需要使用过度动画的节点外层使用
```
<transition show="showName">
    <any></any>
</transition>
```
在js中
``` javascript
var transition = new Transition();
var fade = {
    opacity: 0,
}
var show = {
    opacity: 1,
}
var appear = {
    transition: 'opacity 1s ease-in-out'
}
// 在此绑定你想要实现某动画的element的class
transition.cssAnimation({ fade: fade, appear: appear, show: show }, 'someName');
var test = function () {
    var someName = transition.state.someName;
    transition.setState({ someName: !someName })
}
```