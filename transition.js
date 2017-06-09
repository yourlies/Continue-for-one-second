var Transition = (function() {
    var _Transition = function (el) {
        this.el = el;

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
        this.el.setAttributeNode(this.classNode);
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

    _Transition.prototype.bindVariableListener = function (state, watch) {
        var descriptor = {};
        if (watch.getter) {
            descriptor.get = function () {
                watch.getter();
            }
        }
        if (watch.setter) {
            descriptor.set = function (val) {
                watch.setter(val);
            }
        }
        Object.defineProperty(state, watch.variable, descriptor);
    }

    var classesListener = function (_transition, variableShow) {
        return {
            variable: `${variableShow}-transitionClass`,
            setter: function (val) {
                _transition.classesCreator(val);
                _transition.classesSorter();
                _transition.classesRender();
            }
        }
    }

    var showListener = function (_transition, el, variableShow) {
        return {
            variable: variableShow,
            setter: function (val) {
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

                var task = el.style.display = val
                    ? _transition.taskCreator(fade)
                    : _transition.taskCreator(show);

                _transition.tasksQueue(task, function (transition) {
                    setTimeout(function () {
                        transition.tasksCount--;
                        if (transition.tasksCount == 0) {
                            el.style.display = val
                                ? 'none'
                                : 'block';
                        }
                    }, 1000);
                });
            }
        }
    }

    var createReplaceTransitionEl = function (_this, state, el) {
        var elClone = el;
        var elReplace = document.createElement('div');
        elReplace.innerHTML = elClone.innerHTML;
        var transitionId = document.createAttribute('transition-id');
        transitionId.value = 1;
        elReplace.setAttributeNode(transitionId);
        el.parentNode.replaceChild(elReplace, el);
        var variableShow = elClone.getAttribute('show');
        state[variableShow] = false;
        state[`${variableShow}-transitionClass`] = false;
        _this.state[variableShow] = false;
        return { elReplace: elReplace, variableShow: variableShow };
    }

    var bindTransitionEl = function (_this, state) {
        var el = document.getElementsByTagName('transition');
        while (el.length > 0) {
            var elInfo = createReplaceTransitionEl(_this, state, el[0]);
            var _transition = new _Transition(elInfo.elReplace);
            var listener = showListener(_transition, elInfo.elReplace, elInfo.variableShow);
            _transition.bindVariableListener(state, listener);
            _transition.bindVariableListener(state, classesListener(_transition, elInfo.variableShow));
        }
    }

    const state = {};

    var Transition = function () {
        this.state = {};
        bindTransitionEl(this, state);
    }

    Transition.prototype.cssAnimation = function (classes, variableShow) {
        state[`${variableShow}-transitionClass`] = classes;
    }
    
    Transition.prototype.setState = function (changes) {
        for (var key in changes) {
            this.state[key] = changes[key];
            state[key] = changes[key];
        }
    }

    return Transition;
})()
