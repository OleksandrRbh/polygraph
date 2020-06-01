// переменные

let pageUpBtn = document.querySelector('#page-up-btn');
let shopNavBtn = document.querySelector('#shop-nav-btn');
let dropdownPopup = document.querySelector('#dropdown-popup');
let overlay = document.querySelector('#overlay');
let dropCloseBtn = document.querySelector('#dropdown-close-btn');

let mobNavMenu = document.querySelector('#mobile-nav');
let mobNavOpenBtn = document.querySelector('#mobile-nav-open-btn');
let mobNavCloseBtn = document.querySelector('#mobile-nav-close-btn');

// прокрутка страницы вверх

pageUpBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
})

// мобильная навигация

mobNavOpenBtn.addEventListener('click', () => {
  mobNavMenu.classList.add('mobile-nav--active');
})

mobNavCloseBtn.addEventListener('click', () => {
  mobNavMenu.classList.remove('mobile-nav--active');
})


// выпадающий список-меню категорий

shopNavBtn.addEventListener('click', () => {
  dropdownPopup.classList.toggle('show');
  overlay.classList.toggle('overlay--active');
})

overlay.addEventListener('click', () => {
  overlay.classList.remove('overlay--active');
  dropdownPopup.classList.remove('show');
})

dropCloseBtn.addEventListener('click', () => {
  overlay.classList.remove('overlay--active');
  dropdownPopup.classList.remove('show');
})


// главный слайдер

let mainSlider = document.querySelector('#main-slider');
let mainSlideBtnLeft = document.querySelector('#main-slide-btn-left');
let mainSlideBtnRight = document.querySelector('#main-slide-btn-right');


'use strict';

(function(){

  var multiItemSlider = (function () {

    function _isElementVisible(element) {
      var rect = element.getBoundingClientRect(),
        vWidth = window.innerWidth || doc.documentElement.clientWidth,
        vHeight = window.innerHeight || doc.documentElement.clientHeight,
        elemFromPoint = function (x, y) { return document.elementFromPoint(x, y) };
      if (rect.right < 0 || rect.bottom < 0
        || rect.left > vWidth || rect.top > vHeight)
        return false;
      return (
        element.contains(elemFromPoint(rect.left, rect.top))
        || element.contains(elemFromPoint(rect.right, rect.top))
        || element.contains(elemFromPoint(rect.right, rect.bottom))
        || element.contains(elemFromPoint(rect.left, rect.bottom))
      );
    }

    return function (selector, config) {
      var
        _mainElement = document.querySelector('.main-slider'), // основный элемент блока
        _sliderWrapper = _mainElement.querySelector('.main-slider__wrapper'), // обертка для .slider-item
        _sliderItems = _mainElement.querySelectorAll('.main-slider__slide'), // элементы (.slider-item)
        _sliderControls = _mainElement.querySelectorAll('.slider-btn'), // элементы управления
        _sliderControlLeft = _mainElement.querySelector('.slider-btn--left'), // кнопка "LEFT"
        _sliderControlRight = _mainElement.querySelector('.slider-btn--right'), // кнопка "RIGHT"
        _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width), // ширина обёртки
        _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width), // ширина одного элемента
        _positionLeftItem = 0, // позиция левого активного элемента
        _transform = 0, // значение транфсофрмации .slider_wrapper
        _step = _itemWidth / _wrapperWidth * 100, // величина шага (для трансформации)
        _items = [], // массив элементов
        _interval = 0,
        _html = _mainElement.innerHTML,
        _states = [
          { active: false, minWidth: 0, count: 1 },
          { active: false, minWidth: 980, count: 2 }
        ],
        _config = {
          isCycling: false, // автоматическая смена слайдов
          direction: 'right', // направление смены слайдов
          interval: 5000, // интервал между автоматической сменой слайдов
          pause: true // устанавливать ли паузу при поднесении курсора к слайдеру
        };

      for (var key in config) {
        if (key in _config) {
          _config[key] = config[key];
        }
      }

      // наполнение массива _items
      _sliderItems.forEach(function (item, index) {
        _items.push({ item: item, position: index, transform: 0 });
      });

      var _setActive = function () {
        var _index = 0;
        var width = parseFloat(document.body.clientWidth);
        _states.forEach(function (item, index, arr) {
          _states[index].active = false;
          if (width >= _states[index].minWidth)
            _index = index;
        });
        _states[_index].active = true;
      }

      var _getActive = function () {
        var _index;
        _states.forEach(function (item, index, arr) {
          if (_states[index].active) {
            _index = index;
          }
        });
        return _index;
      }

      var position = {
        getItemMin: function () {
          var indexItem = 0;
          _items.forEach(function (item, index) {
            if (item.position < _items[indexItem].position) {
              indexItem = index;
            }
          });
          return indexItem;
        },
        getItemMax: function () {
          var indexItem = 0;
          _items.forEach(function (item, index) {
            if (item.position > _items[indexItem].position) {
              indexItem = index;
            }
          });
          return indexItem;
        },
        getMin: function () {
          return _items[position.getItemMin()].position;
        },
        getMax: function () {
          return _items[position.getItemMax()].position;
        }
      }

      var _transformItem = function (direction) {
        var nextItem;
        if (!_isElementVisible(_mainElement)) {
          return;
        }
        if (direction === 'right') {
          _positionLeftItem++;
          if ((_positionLeftItem + _wrapperWidth / _itemWidth - 1) > position.getMax()) {
            nextItem = position.getItemMin();
            _items[nextItem].position = position.getMax() + 1;
            _items[nextItem].transform += _items.length * 100;
            _items[nextItem].item.style.transform = 'translateX(' + _items[nextItem].transform + '%)';
          }
          _transform -= _step;
        }
        if (direction === 'left') {
          _positionLeftItem--;
          if (_positionLeftItem < position.getMin()) {
            nextItem = position.getItemMax();
            _items[nextItem].position = position.getMin() - 1;
            _items[nextItem].transform -= _items.length * 100;
            _items[nextItem].item.style.transform = 'translateX(' + _items[nextItem].transform + '%)';
          }
          _transform += _step;
        }
        _sliderWrapper.style.transform = 'translateX(' + _transform + '%)';
      }

      var _cycle = function (direction) {
        if (!_config.isCycling) {
          return;
        }
        _interval = setInterval(function () {
          _transformItem(direction);
        }, _config.interval);
      }

      // обработчик события click для кнопок "назад" и "вперед"
      var _controlClick = function (e) {
        if (e.target.classList.contains('slider-btn')) {
          e.preventDefault();
          var direction = e.target.classList.contains('slider-btn--right') ? 'right' : 'left';
          _transformItem(direction);
          clearInterval(_interval);
          _cycle(_config.direction);
        }
      };

      // обработка события изменения видимости страницы
      var _handleVisibilityChange = function () {
        if (document.visibilityState === "hidden") {
          clearInterval(_interval);
        } else {
          clearInterval(_interval);
          _cycle(_config.direction);
        }
      }

      var _refresh = function () {
        clearInterval(_interval);
        _mainElement.innerHTML = _html;
        _sliderWrapper = _mainElement.querySelector('.main-slider__wrapper');
        _sliderItems = _mainElement.querySelectorAll('.main-slider__slide');
        _sliderControls = _mainElement.querySelectorAll('.slider-btn');
        _sliderControlLeft = _mainElement.querySelector('.slider-btn--left');
        _sliderControlRight = _mainElement.querySelector('.slider-btn--right');
        _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width);
        _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width);
        _positionLeftItem = 0;
        _transform = 0;
        _step = _itemWidth / _wrapperWidth * 100;
        _items = [];
        _sliderItems.forEach(function (item, index) {
          _items.push({ item: item, position: index, transform: 0 });
        });
      }

      var _setUpListeners = function () {
        _mainElement.addEventListener('click', _controlClick);
        if (_config.pause && _config.isCycling) {
          _mainElement.addEventListener('mouseenter', function () {
            clearInterval(_interval);
          });
          _mainElement.addEventListener('mouseleave', function () {
            clearInterval(_interval);
            _cycle(_config.direction);
          });
        }
        document.addEventListener('visibilitychange', _handleVisibilityChange, false);
        window.addEventListener('resize', function () {
          var
            _index = 0,
            width = parseFloat(document.body.clientWidth);
          _states.forEach(function (item, index, arr) {
            if (width >= _states[index].minWidth)
              _index = index;
          });
          if (_index !== _getActive()) {
            _setActive();
            _refresh();
          }
        });
      }

      // инициализация
      _setUpListeners();
      if (document.visibilityState === "visible") {
        _cycle(_config.direction);
      }
      _setActive();

      return {
        right: function () { // метод right
          _transformItem('right');
        },
        left: function () { // метод left
          _transformItem('left');
        },
        stop: function () { // метод stop
          _config.isCycling = false;
          clearInterval(_interval);
        },
        cycle: function () { // метод cycle
          _config.isCycling = true;
          clearInterval(_interval);
          _cycle();
        }
      }

    }
  }());

  var slider = multiItemSlider('.slider', {
    isCycling: true
  })

})();




// слайдер клиентов

(function(){

  var multiItemSlider = (function () {
    return function (selector, config) {
      var
        _mainElement = document.querySelector('.clients-slider'), // основный элемент блока
        _sliderWrapper = _mainElement.querySelector('.clients-slider__wrapper'), // обертка для .slider-item
        _sliderItems = _mainElement.querySelectorAll('.clients-slider__slide'), // элементы (.slider-item)
        _sliderControls = _mainElement.querySelectorAll('.cslider-btn'), // элементы управления
        _sliderControlLeft = _mainElement.querySelector('.cslider-btn--left'), // кнопка "LEFT"
        _sliderControlRight = _mainElement.querySelector('.cslider-btn--right'), // кнопка "RIGHT"
        _wrapperWidth = parseFloat(getComputedStyle(_sliderWrapper).width), // ширина обёртки
        _itemWidth = parseFloat(getComputedStyle(_sliderItems[0]).width), // ширина одного элемента
        _positionLeftItem = 0, // позиция левого активного элемента
        _transform = 0, // значение транфсофрмации .slider_wrapper
        _step = _itemWidth / _wrapperWidth * 100, // величина шага (для трансформации)
        _items = [], // массив элементов
        _interval = 0,
        _config = {
          isCycling: false, // автоматическая смена слайдов
          direction: 'right', // направление смены слайдов
          interval: 5000, // интервал между автоматической сменой слайдов
          pause: true // устанавливать ли паузу при поднесении курсора к слайдеру
        };

      for (var key in config) {
        if (key in _config) {
          _config[key] = config[key];
        }
      }

      // наполнение массива _items
      _sliderItems.forEach(function (item, index) {
        _items.push({ item: item, position: index, transform: 0 });
      });

      var position = {
        getItemMin: function () {
          var indexItem = 0;
          _items.forEach(function (item, index) {
            if (item.position < _items[indexItem].position) {
              indexItem = index;
            }
          });
          return indexItem;
        },
        getItemMax: function () {
          var indexItem = 0;
          _items.forEach(function (item, index) {
            if (item.position > _items[indexItem].position) {
              indexItem = index;
            }
          });
          return indexItem;
        },
        getMin: function () {
          return _items[position.getItemMin()].position;
        },
        getMax: function () {
          return _items[position.getItemMax()].position;
        }
      }

      var _transformItem = function (direction) {
        var nextItem;
        if (direction === 'right') {
          _positionLeftItem++;
          if ((_positionLeftItem + _wrapperWidth / _itemWidth - 1) > position.getMax()) {
            nextItem = position.getItemMin();
            _items[nextItem].position = position.getMax() + 1;
            _items[nextItem].transform += _items.length * 100;
            _items[nextItem].item.style.transform = 'translateX(' + _items[nextItem].transform + '%)';
          }
          _transform -= _step;
        }
        if (direction === 'left') {
          _positionLeftItem--;
          if (_positionLeftItem < position.getMin()) {
            nextItem = position.getItemMax();
            _items[nextItem].position = position.getMin() - 1;
            _items[nextItem].transform -= _items.length * 100;
            _items[nextItem].item.style.transform = 'translateX(' + _items[nextItem].transform + '%)';
          }
          _transform += _step;
        }
        _sliderWrapper.style.transform = 'translateX(' + _transform + '%)';
      }

      var _cycle = function (direction) {
        if (!_config.isCycling) {
          return;
        }
        _interval = setInterval(function () {
          _transformItem(direction);
        }, _config.interval);
      }

      // обработчик события click для кнопок "назад" и "вперед"
      var _controlClick = function (e) {
        if (e.target.classList.contains('cslider-btn')) {
          e.preventDefault();
          var direction = e.target.classList.contains('cslider-btn--right') ? 'right' : 'left';
          _transformItem(direction);
          clearInterval(_interval);
          _cycle(_config.direction);
        }
      };

      var _setUpListeners = function () {
        // добавление к кнопкам "назад" и "вперед" обрботчика _controlClick для событя click
        _sliderControls.forEach(function (item) {
          item.addEventListener('click', _controlClick);
        });
        if (_config.pause && _config.isCycling) {
          _mainElement.addEventListener('mouseenter', function () {
            clearInterval(_interval);
          });
          _mainElement.addEventListener('mouseleave', function () {
            clearInterval(_interval);
            _cycle(_config.direction);
          });
        }
      }

      // инициализация
      _setUpListeners();
      _cycle(_config.direction);

      return {
        right: function () { // метод right
          _transformItem('right');
        },
        left: function () { // метод left
          _transformItem('left');
        },
        stop: function () { // метод stop
          _config.isCycling = false;
          clearInterval(_interval);
        },
        cycle: function () { // метод cycle
          _config.isCycling = true;
          clearInterval(_interval);
          _cycle();
        }
      }

    }
  }());

  var slider = multiItemSlider('.slider', {
    isCycling: true
  })


})();

//# sourceMappingURL=main.js.map
