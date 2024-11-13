"use strict";
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license Licensed under the MIT license.
 */
var AnimationType;
(function (AnimationType) {
    AnimationType["Clip"] = "clip";
    AnimationType["LoadingBar"] = "loading-bar";
    AnimationType["Push"] = "push";
    AnimationType["Rotate1"] = "rotate-1";
    AnimationType["Rotate2"] = "rotate-2";
    AnimationType["Rotate3"] = "rotate-3";
    AnimationType["Scale"] = "scale";
    AnimationType["Slide"] = "slide";
    AnimationType["Type"] = "type";
    AnimationType["Zoom"] = "zoom";
})(AnimationType || (AnimationType = {}));
var DefaultOptions;
(function (DefaultOptions) {
    DefaultOptions[DefaultOptions["AnimationDelay"] = 2500] = "AnimationDelay";
    DefaultOptions[DefaultOptions["LettersDelay"] = 50] = "LettersDelay";
})(DefaultOptions || (DefaultOptions = {}));
// Factory
function AnimatedHeadline(selector, options = {}) {
    const element = document.querySelector(selector);
    let animation;
    switch (options.animationType) {
        case AnimationType.Clip:
            animation = new ClipAnimatedWords(element, options.animationDelay, options.revealAnimationDelay, options.revealDuration);
            break;
        case AnimationType.LoadingBar:
            animation = new LoadingBarAnimatedWords(element, options.barAnimationDelay, options.barWaiting);
            break;
        case AnimationType.Push:
        case AnimationType.Slide:
        case AnimationType.Rotate1:
        case AnimationType.Zoom:
            animation = new AnimatedWords(element, options.animationDelay);
            break;
        case AnimationType.Scale:
        case AnimationType.Rotate2:
        case AnimationType.Rotate3:
            animation = new AnimatedSingleLetters(element, options.animationDelay, options.lettersDelay);
            break;
        case AnimationType.Type:
            animation = new TypeAnimatedWords(element, options.animationDelay, options.lettersDelay, options.typeAnimationDelay, options.selectionDuration);
            break;
        default:
            throw 'invalid animation type ' + options.animationType;
    }
    element.classList.add(options.animationType);
    return animation;
}
// @see https://javascript.info/js-animation
function animate(timing, draw, duration) {
    let start = performance.now();
    requestAnimationFrame(function animate(time) {
        // timeFraction goes from 0 to 1
        let timeFraction = (time - start) / duration;
        if (timeFraction > 1)
            timeFraction = 1;
        // calculate the current animation state
        let progress = timing(timeFraction);
        draw(progress);
        if (timeFraction < 1) {
            requestAnimationFrame(animate);
        }
    });
}
class AnimatedWords {
    #isStopped = false;
    duration = 0;
    animationDelay;
    rootElement;
    wordSelector = 'b';
    visibleClassName = 'is-visible';
    hiddenClassName = 'is-hidden';
    constructor(element, animationDelay = DefaultOptions.AnimationDelay) {
        this.rootElement = element;
        this.animationDelay = animationDelay;
        this.duration = animationDelay;
        this.init();
        this.start();
    }
    init() {
        this.resize();
    }
    resize() {
        let width = 0;
        // assign to wrapper element the width of its longest word
        this.rootElement.querySelectorAll(this.wordSelector).forEach(function (e) {
            width = Math.max(e.offsetWidth, width);
        });
        this.rootElement.style.width = width.toString();
    }
    /** @api */
    start() {
        this.#isStopped = false;
        this.runAfter(this.duration, () => this.next());
    }
    /** @api */
    stop() {
        this.#isStopped = true;
    }
    /** @api */
    current() {
        const visibleElement = this.rootElement.querySelector(this.wordSelector + '.' + this.visibleClassName);
        if (visibleElement === null) {
            return this.rootElement.querySelector(this.wordSelector);
        }
        return visibleElement;
    }
    // main logic
    next(word = null) {
        word = word ?? this.current();
        const nextWord = this.getNextWord(word);
        this.switchWord(word, nextWord);
        this.runAfter(this.animationDelay, () => this.next(nextWord));
    }
    getNextWord(word) {
        return (word.nextElementSibling ? word.nextElementSibling : word.parentNode.children[0]);
    }
    switchWord(oldWord, newWord) {
        this.makeHidden(oldWord);
        this.makeVisible(newWord);
    }
    makeVisible(element) {
        element.classList.remove(this.hiddenClassName);
        element.classList.add(this.visibleClassName);
    }
    makeHidden(element) {
        element.classList.remove(this.visibleClassName);
        element.classList.add(this.hiddenClassName);
    }
    runAfter(duration, callable) {
        animate((timeFraction) => { return timeFraction; }, (timePassed) => {
            if (this.#isStopped) {
                throw 'execution aborted';
            }
            if (timePassed !== 1) {
                return;
            }
            callable();
        }, duration);
    }
}
class AnimatedSingleLetters extends AnimatedWords {
    lettersDelay;
    letterClassName = 'letter';
    constructor(element, animationDelay = DefaultOptions.AnimationDelay, lettersDelay = DefaultOptions.LettersDelay) {
        super(element, animationDelay);
        this.lettersDelay = lettersDelay;
        this.rootElement.querySelectorAll(this.wordSelector).forEach(this.splitIntoSingleLetters, this);
    }
    next(word = null) {
        word = word ?? this.current();
        const nextWord = this.getNextWord(word);
        const isHideWordIfLastLetter = word.querySelectorAll('.' + this.letterClassName).length >= nextWord.querySelectorAll('.' + this.letterClassName).length;
        this.hideLetter(word.querySelector('.' + this.letterClassName), word, isHideWordIfLastLetter);
        this.showLetter(nextWord.querySelector('.' + this.letterClassName), nextWord, !isHideWordIfLastLetter);
    }
    hideLetter(letter, word, isHideWordIfLastLetter) {
        this.hideOrShowLetter(letter, word, isHideWordIfLastLetter, true);
    }
    showLetter(letter, word, isHideWordIfLastLetter) {
        this.hideOrShowLetter(letter, word, isHideWordIfLastLetter, false);
    }
    hideOrShowLetter(letter, word, isHideWordIfLastLetter = true, isHide = false) {
        isHide ? this.makeHidden(letter) : this.makeVisible(letter);
        if (letter.nextElementSibling) {
            this.runAfter(this.lettersDelay, () => this.hideOrShowLetter(letter.nextElementSibling, word, isHideWordIfLastLetter, isHide));
        }
        else if (isHideWordIfLastLetter) {
            this.runAfter(this.animationDelay, () => this.next(isHide ? this.getNextWord(word) : word));
        }
    }
    splitIntoSingleLetters(word) {
        const visibleClassName = this.visibleClassName;
        const letters = word.textContent.split(''), selected = word.classList.contains(visibleClassName);
        for (let i in letters) {
            const element = document.createElement('span');
            element.classList.add(this.letterClassName);
            if (selected) {
                element.classList.add(visibleClassName);
            }
            element.innerHTML = letters[i];
            letters[i] = element.outerHTML;
        }
        word.innerHTML = letters.join('');
        word.style.opacity = "1";
    }
}
class TypeAnimatedWords extends AnimatedSingleLetters {
    #waitingClassName = 'waiting';
    #selectedClassName = 'selected';
    typeAnimationDelay;
    selectionDuration;
    constructor(element, animationDelay = DefaultOptions.AnimationDelay, lettersDelay = DefaultOptions.LettersDelay, typeAnimationDelay = 1300, selectionDuration = 500) {
        super(element, animationDelay, lettersDelay);
        this.typeAnimationDelay = typeAnimationDelay;
        this.selectionDuration = selectionDuration;
    }
    resize() {
        // disable resizing
    }
    showWord(word) {
        this.showLetter(word.querySelector('.' + this.letterClassName), word);
        this.makeVisible(word);
    }
    next(word = null) {
        word = word ?? this.current();
        const nextWord = this.getNextWord(word);
        const parentSpan = word.parentNode;
        parentSpan.classList.add(this.#selectedClassName);
        parentSpan.classList.remove(this.#waitingClassName);
        this.runAfter(this.selectionDuration, () => {
            parentSpan.classList.remove(this.#selectedClassName);
            this.makeHidden(word);
            word.querySelectorAll('.' + this.letterClassName).forEach((e) => {
                this.makeHidden(e);
            });
        });
        this.runAfter(this.typeAnimationDelay, () => this.showWord(nextWord));
    }
    showLetter(letter, word, isHideWordIfLastLetter = true) {
        super.showLetter(letter, word, isHideWordIfLastLetter);
        if (!letter.nextElementSibling) {
            this.runAfter(200, () => word.parentNode.classList.add(this.#waitingClassName));
        }
    }
}
class ClipAnimatedWords extends AnimatedWords {
    revealAnimationDelay;
    revealDuration;
    constructor(element, animationDelay = DefaultOptions.AnimationDelay, revealAnimationDelay = 1500, revealDuration = 600) {
        super(element, animationDelay);
        this.revealAnimationDelay = revealAnimationDelay;
        this.revealDuration = revealDuration;
    }
    resize() {
        this.rootElement.style.width = String(this.rootElement.offsetWidth + 10);
    }
    showWord(word) {
        let animation = word.parentNode.animate([{ width: '2px' }, { width: word.offsetWidth + 'px' }], { duration: this.revealDuration });
        animation.onfinish = (e) => {
            this.runAfter(this.revealAnimationDelay, () => this.next(word));
        };
    }
    next(word = null) {
        word = word ?? this.current();
        const nextWord = this.getNextWord(word);
        let animation = word.parentNode.animate([{ width: word.offsetWidth + 'px' }, { width: '2px' }], { duration: this.revealDuration });
        animation.onfinish = (e) => {
            this.switchWord(word, nextWord);
            this.showWord(nextWord);
        };
    }
}
class LoadingBarAnimatedWords extends AnimatedWords {
    #loadingClassName = 'is-loading';
    barWaiting;
    constructor(element, barAnimationDelay = 3800, barWaiting = 800) {
        super(element, barAnimationDelay);
        this.barWaiting = barWaiting;
    }
    init() {
        super.init();
        this.runAfter(this.barWaiting, () => this.rootElement.classList.add(this.#loadingClassName));
    }
    next(word = null) {
        super.next(word);
        word = word ?? this.current();
        word.parentNode.classList.remove(this.#loadingClassName);
        this.runAfter(this.barWaiting, () => word.parentNode.classList.add(this.#loadingClassName));
    }
}
//# sourceMappingURL=animated-headline.js.map