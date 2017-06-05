var Transition = (function() {

    var el = document.getElementsByTagName('transition');
    var elClone = el.item(0);
    var elReplace = document.createElement('div');
    elReplace.innerHTML = elClone.innerHTML;
    var transitionId = document.createAttribute('transition-id');
    transitionId.value = 1;
    elReplace.setAttributeNode(transitionId);
    el.item(0).parentNode.replaceChild(elReplace, el.item(0).parentNode.childNodes[1]);
    var variableShow = elClone.getAttribute('show');

    var _Transition = function () {
        this.state = {};
    };

    _Transition.prototype.bindVariableListener = function (watch) {
        Object.defineProperty(this.state, watch.variable, {
            set: function (val) {
                watch.func(val);
            }
        })
    }

    var _transition = new _Transition();

    var showListener ={
        variable: variableShow,
        func: function (val) {
            elReplace.style.display = val
            ? 'block'
            : 'none';
        }
    }

    _transition.bindVariableListener(showListener);

    console.log(_transition.state.isShow = true)

    var Transition = function () {
        this.state = {};
        this.state[variableShow] = true;
    }
    
    Transition.prototype.setState = function (object, changes) {
        object[variableShow] = changes.isShow;
        _transition.state[variableShow] = changes.isShow;
    }
    return Transition;
})()