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

    _Transition.prototype.cssParser = function (css) {
        this.cssSelector = [];
        for (var key in css) {
            this.cssSelector.push({
                key: `CFOSTransition-${key}`,
                value: css[key],
            });
        }
    }

    _Transition.prototype.cssSetter = function () {
        this.classNode = document.createAttribute('class');
        this.classes = { arr: [], obj: {} };
        elReplace.setAttributeNode(this.classNode);
    }

    _Transition.prototype.cssRender = function () {
        this.style = [];
        for (var key in this.cssSelector) {
            var cssKey = this.cssSelector[key].key;
            var cssValue = JSON.stringify(this.cssSelector[key].value);
            cssValue = cssValue.replace(/,/g, ';');
            cssValue = cssValue.replace(/"/g, '');
            this.style.push({ cssKey: cssKey, cssValue: cssValue })
        }
        var style = '';
        for (var i = 0; i < this.style.length; i++) {
            style = `${style}.${this.style[i].cssKey}${this.style[i].cssValue}`
        }
        var styleNode = document.createElement('style');
        styleNode.innerHTML = style;
        document.head.appendChild(styleNode)
    }

    _Transition.prototype.updateClass = function (className) {
        var index = this.classes.arr = [className];
        this.classes.obj[className] = index;
        this.classNode.value = this.classes.arr.join(' ');
    }

    _Transition.prototype.bindVariableListener = function (watch) {
        Object.defineProperty(this.state, watch.variable, {
            set: function (val) {
                watch.func(val);
            }
        })
    }

    var _transition = new _Transition();

    var showListener = {
        variable: variableShow,
        func: function (val) {
            elReplace.style.display = val
            ? _transition.updateClass(_transition.cssSelector[1].key)
            : _transition.updateClass(_transition.cssSelector[0].key);
        }
    }

    _transition.bindVariableListener(showListener);

    var Transition = function () {
        this.state = {};
        this.state[variableShow] = true;
    }

    Transition.prototype.cssAnimation = function (css) {
        _transition.cssParser(css);
        _transition.cssSetter();
        _transition.cssRender();
        var cssSelector = _transition.cssSelector;
        
    }
    
    Transition.prototype.setState = function (object, changes) {
        object[variableShow] = changes.isShow;
        _transition.state[variableShow] = changes.isShow;
    }

    return Transition;
})()