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
        this.tasks = []; this.tasksCount = 0;

        this.style = [];
        this.scopedClasses = [];
        this.sortedClasses = {
            classesIndexToKey: [],
            classesKeyToIndex: {},
            classesRawKeyToIndex: {},
            classes: []
        };

        this.classNode = document.createAttribute('class');
        elReplace.setAttributeNode(this.classNode);
        this.styleNode = document.createElement('style');
        document.head.appendChild(this.styleNode)

    };

    _Transition.prototype.classesCreator = function (classes) {
        for (var key in classes) {
            this.scopedClasses.push({
                rawKey: key,
                key: `CFOSTransition-${key}`,
                value: classes[key],
            });
        }
    }

    _Transition.prototype.classesSorter = function () {
        for (var i = 0; i < this.scopedClasses.length; i++) {
            var index = this.sortedClasses.classesIndexToKey.push(this.scopedClasses[i].key);
            this.sortedClasses.classesRawKeyToIndex[this.scopedClasses[i].rawKey] = index - 1;
            this.sortedClasses.classesKeyToIndex[this.scopedClasses[i].key] = index - 1;
            this.sortedClasses.classes.push('');
        }
    }

    _Transition.prototype.classesRender = function () {
        for (var i = 0; i < this.scopedClasses.length; i++) {
            var className = this.scopedClasses[i].key;
            var classValue = JSON.stringify(this.scopedClasses[i].value);
            classValue = classValue.replace(/,/g, ';');
            classValue = classValue.replace(/"/g, '');
            this.style.push(`.${className}${classValue}`)
        }

        this.styleNode.innerHTML = this.style.join('');
    }

    _Transition.prototype.updateClass = function () {
        var classes = this.sortedClasses.classes.join(' ');
        classes = classes.trim();
        classes = classes.replace(/[ ]+/g, ' ');
        this.classNode.value = classes;
    }

    _Transition.prototype.removeClass = function (className) {
        var index = this.sortedClasses.classesKeyToIndex[className];
        this.sortedClasses.classes[index] = '';
        this.updateClass();
    }

    _Transition.prototype.insertClass = function (className) {
        var index = this.sortedClasses.classesKeyToIndex[className];
        this.sortedClasses.classes[index] = className;
        this.updateClass();
    }

    _Transition.prototype.taskCreator = function (task) {
        var _this = this;
        return function () {
            new Promise (function (resolve) {
                task(_this, resolve);
            })
        }
    }

    _Transition.prototype.tasksQueue = function (task, callback) {
        var _this = this;
        this.tasksCount++;
        this.tasks.push(task());
        Promise.all(this.tasks).then(function () {
            callback(_this);
        });
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
            var fadeIndex = _transition.sortedClasses.classesRawKeyToIndex['fade'];
            var showIndex = _transition.sortedClasses.classesRawKeyToIndex['show'];
            var appearIndex = _transition.sortedClasses.classesRawKeyToIndex['appear'];
            var fadeClass = _transition.sortedClasses.classesIndexToKey[fadeIndex];
            var showClass = _transition.sortedClasses.classesIndexToKey[showIndex];
            var appearClass = _transition.sortedClasses.classesIndexToKey[appearIndex];

            var fade = function (_, resolve) {
                _transition.insertClass(appearClass);
                _transition.removeClass(showClass);
                _transition.insertClass(fadeClass);
                resolve();

            };
            var show = function (_, resolve) {
                _transition.insertClass(appearClass);
                _transition.insertClass(showClass);
                _transition.removeClass(fadeClass);
                resolve();
            }

            var task = elReplace.style.display = val
                ? _transition.taskCreator(show)
                : _transition.taskCreator(fade);

            _transition.tasksQueue(task, function (transition) {
                setTimeout(function () {
                    transition.tasksCount--;
                    if (transition.tasksCount == 0) {
                        elReplace.style.display = val
                            ? 'block'
                            : 'none';
                    }
                }, 1000);
            });
        }
    }

    _transition.bindVariableListener(showListener);

    var Transition = function () {
        this.state = {};
        this.state[variableShow] = true;
    }

    Transition.prototype.cssAnimation = function (css) {
        _transition.classesCreator(css);
        _transition.classesSorter();
        _transition.classesRender();
    }
    
    Transition.prototype.setState = function (object, changes) {
        object[variableShow] = changes.isShow;
        _transition.state[variableShow] = changes.isShow;
    }

    return Transition;
})()