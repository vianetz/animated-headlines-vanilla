/**!
 * Vanilla JavaScript Animated Headline Component
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license Licensed under the MIT license.
 *
 * @class
 * @param {string} selector - The HTML id of the animated headline container.
 * @param {object} options - User defined settings for the animated headline.
 */
var AnimatedHeadline=function(selector, options) {
    const settings = extend({
        animationType: 'type',
        animationDelay: 2500,
        barAnimationDelay: 3800,
        barWaiting: 800,
        lettersDelay: 50,
        typeLettersDelay: 150,
        selectionDuration: 500,
        typeAnimationDelay: 1300,
        revealDuration: 600,
        revealAnimationDelay: 1500
    }, options);

    const headlineElements = document.querySelectorAll(selector);
    const duration = settings.animationDelay;

    headlineElements.forEach(function (headlineElement) {
        if (settings.animationType) {
            headlineElement.querySelector('.ah-headline').classList.add(settings.animationType);

            if (settings.animationType === 'type' ||
                settings.animationType === 'rotate-2' ||
                settings.animationType === 'rotate-3' ||
                settings.animationType === 'scale') {
                headlineElement.querySelector('.ah-headline').classList.add('letters');
            } else if (settings.animationType === 'clip') {
                headlineElement.querySelector('.ah-headline').classList.add('is-full-width');
            }
        }

        singleLetters(headlineElement.querySelectorAll('.ah-headline.letters b'));

        var spanWrapper = headlineElement.querySelector('.ah-words-wrapper');

        if (headlineElement.classList.contains('loading-bar')) {
            duration = settings.barAnimationDelay;
            setTimeout(function () {
                spanWrapper.classList.add('is-loading');
            }, settings.barWaiting);
        } else if (headlineElement.classList.contains('clip')) {
            spanWapper.classList.style.width = parseFloat(getComputedStyle(spanWrapper, null).width.replace("px", "")) + 10;
        } else if (!headlineElement.querySelector('.ah-headline').classList.contains('type')) {
            //assign to .ah-words-wrapper the width of its longest word
            var width = 0;
            var words = headlineElement.querySelectorAll('.ah-words-wrapper b').forEach(function (e) {
                var wordWidth = parseFloat(getComputedStyle(e, null).width.replace("px", ""));
                if (wordWidth > width) width = wordWidth;
            });

            spanWrapper.style.width = width;
        }

        // trigger animation
        setTimeout(function () {
            hideWord(headlineElement.querySelector('.is-visible'))
        }, duration);
    });

    function singleLetters(words) {
        words.forEach(function(word) {
            var letters = word.textContent.split(''),
                selected = word.classList.contains('is-visible');
            for (i in letters) {
                if (settings.animationType === 'rotate-2') letters[i] = '<em>' + letters[i] + '</em>';
                letters[i] = (selected) ? '<i class="in">' + letters[i] + '</i>': '<i>' + letters[i] + '</i>';
            }

            word.innerHTML = letters.join('');
            word.style.opacity = 1;
        });
    }

    function hideWord(word) {
        var nextWord = takeNext(word);

        if (settings.animationType === 'type') {
            var parentSpan = word.parentNode;
            parentSpan.classList.add('selected');
            parentSpan.classList.remove('waiting');
            setTimeout(function(){
                parentSpan.classList.remove('selected');
                word.classList.remove('is-visible');
                word.classList.add('is-hidden');
                word.querySelectorAll('i').forEach(function(e) {e.classList.remove('in'); e.classList.add('out') });
            }, settings.selectionDuration);
            setTimeout(function(){
                showWord(nextWord, settings.typeLettersDelay)
            }, settings.typeAnimationDelay);
        } else if (settings.animationType === 'letters') {
            var bool = (word.querySelectorAll('i').length >= nextWord.querySelectorAll('i').length) ? true : false;
            hideLetter(word.querySelectorAll('i')[0], word, bool, settings.lettersDelay);
            showLetter(nextWord.querySelectorAll('i')[0], nextWord, bool, settings.lettersDelay);
        } else if (settings.animationType === 'clip') {
            word.parentNode.animate({ width : '2px' }, settings.revealDuration, function(){
                switchWord(word, nextWord);
                showWord(nextWord);
            });
        } else if (settings.animationType === 'loading-bar') {
            word.parentNode.classList.remove('is-loading');
            switchWord(word, nextWord);
            setTimeout(function(){ hideWord(nextWord) }, settings.barAnimationDelay);
            setTimeout(function(){ word.parentNode.classList.add('is-loading') }, settings.barWaiting);
        } else {
            switchWord(word, nextWord);
            setTimeout(function(){
                hideWord(nextWord)
            }, settings.animationDelay);
        }
    }

    function showWord(word, duration) {
        if (settings.animationType === 'type') {
            showLetter(word.querySelectorAll('i')[0], word, false, duration);
            word.classList.add('is-visible');
            word.classList.remove('is-hidden');
        } else if (settings.animationType === 'clip') {
            word.parentNode.animate({ 'width' : word.width() + 10 }, settings.revealDuration, function(){
                setTimeout(function(){
                    hideWord(word)
                }, settings.revealAnimationDelay);
            });
        }
    }

    function hideLetter(letter, word, bool, duration) {
        letter.removeClass('in').addClass('out');

        if(!letter.is(':last-child')) {
            setTimeout(function(){
                hideLetter(letter.next(), word, bool, duration);
            }, duration);
        } else if(bool) {
            setTimeout(function(){
                hideWord(takeNext(word))
            }, settings.animationDelay);
        }

        if(letter.is(':last-child') && $('html').hasClass('no-csstransitions')) {
            var nextWord = takeNext(word);
            switchWord(word, nextWord);
        }
    }

    function showLetter(letter, word, bool, duration) {
        letter.classList.add('in');
        letter.classList.remove('out');

        if (letter.nextElementSibling) {
            setTimeout(function(){
                showLetter(letter.nextElementSibling, word, bool, duration);
            }, duration);
        } else {
            if (settings.animationType === 'type') {
                setTimeout(function(){
                    word.parentNode.classList.add('waiting');
                }, 200);}
            if (!bool) {
                setTimeout(function(){
                    hideWord(word)
                }, settings.animationDelay)
            }
        }
    }

    function takeNext(word) {
        return (word.nextElementSibling) ? word.nextElementSibling : word.parentNode.children[0];
    }

    function takePrev(word) {
        return (word.previousElementSibling) ? word.previousElementSibling : word.parentNode.lastChild;
    }

    function switchWord(oldWord, newWord) {
        oldWord.classList.remove('is-visible');
        oldWord.classList.add('is-hidden');
        newWord.classList.remove('is-hidden');
        newWord.classList.add('is-visible');
    }

    function extend(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;

            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key))
                    out[key] = arguments[i][key];
            }
        }

        return out;
    }
}