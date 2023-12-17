/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license Licensed under the MIT license.
 */

enum AnimationType {
    Clip = 'clip',
    LoadingBar = 'loading-bar',
    Push = 'push',
    Rotate1 = 'rotate-1',
    Rotate2 = 'rotate-2',
    Rotate3 = 'rotate-3',
    Scale = 'scale',
    Slide = 'slide',
    Type = 'type',
    Zoom = 'zoom'
}

enum DefaultOptions {
    AnimationDelay = 2500,
    LettersDelay = 50,
}

type Options = {
    readonly animationType: AnimationType;
    readonly animationDelay: number;
    readonly lettersDelay: number;
    readonly typeAnimationDelay: number;
    readonly selectionDuration: number;
    readonly revealAnimationDelay: number;
    readonly revealDuration: number;
    readonly barAnimationDelay: number;
    readonly barWaiting: number;
}

// Factory
// @todo create alias for legacy AnimatedHeadline
function createAnimatedHeadline(selector: string, options: Partial<Options> = {}): AnimatedHeadline {
    const element = document.querySelector(selector) as HTMLElement;
    let animation;

    switch (options.animationType) {
        case AnimationType.Clip:
            animation = new ClipAnimatedHeadline(element, options.animationDelay, options.revealAnimationDelay, options.revealDuration);
            break;
        case AnimationType.LoadingBar:
            animation = new LoadingBarAnimatedHeadline(element, options.barAnimationDelay, options.barWaiting);
            break;
        case AnimationType.Push:
        case AnimationType.Slide:
        case AnimationType.Rotate1:
        case AnimationType.Zoom:
            animation = new AnimatedHeadline(element, options.animationDelay);
            break;
        case AnimationType.Scale:
        case AnimationType.Rotate2:
        case AnimationType.Rotate3:
            animation = new SingleLettersAnimatedHeadline(element, options.animationDelay, options.lettersDelay);
            break;
        case AnimationType.Type:
            animation = new TypeAnimatedHeadline(element, options.animationDelay, options.lettersDelay, options.typeAnimationDelay, options.selectionDuration);
            break;
        default:
            throw 'invalid animation type ' + options.animationType;
    }
    
    element.classList.add(options.animationType);

    return animation;
}

// @see https://javascript.info/js-animation
function animate(timing: (timeFraction: number) => any, draw: (timePassed: number) => any, duration: number) {
    let start = performance.now();

    requestAnimationFrame(function animate(time) {
        // timeFraction goes from 0 to 1
        let timeFraction = (time - start) / duration;
        if (timeFraction > 1) timeFraction = 1;

        // calculate the current animation state
        let progress = timing(timeFraction);

        draw(progress);

        if (timeFraction < 1) {
            requestAnimationFrame(animate);
        }
    });
}

class AnimatedHeadline {
    #isStopped = false;
    duration = 0;
    protected readonly animationDelay;
    rootElement;

    protected readonly wordSelector = 'b';
    protected readonly visibleClassName = 'is-visible';
    protected readonly hiddenClassName = 'is-hidden';

    constructor(element: HTMLElement, animationDelay: number = DefaultOptions.AnimationDelay) {
        this.rootElement = element;
        this.animationDelay = animationDelay;
        this.duration = animationDelay;

        this.init();
        this.start();
    }

    protected init() {
        this.resize();
    }
    
    protected resize() {
        let width = 0;
        // assign to wrapper element the width of its longest word
        this.rootElement.querySelectorAll(this.wordSelector).forEach(function (e) {
            width = Math.max((e as HTMLElement).offsetWidth, width);
        });

        this.rootElement.style.width = width.toString();
    }

    /** @api */
    public start() {
        this.#isStopped = false;
        this.runAfter(this.duration, () => this.next());
    }

    /** @api */
    public stop() {
        this.#isStopped = true;
    }

    /** @api */
    public current(): HTMLElement {
        const visibleElement = this.rootElement.querySelector(this.wordSelector + '.' + this.visibleClassName) as HTMLElement;
        if (visibleElement === null) {
            return this.rootElement.querySelector(this.wordSelector);
        }

        return visibleElement;
    }

    // main logic
    protected next(word: HTMLElement = null) {
        word = word ?? this.current();
        const nextWord = this.getNextWord(word);

        this.switchWord(word, nextWord);
        this.runAfter(this.animationDelay, () => this.next(nextWord));
    }

    protected getNextWord(word: HTMLElement) {
        return (word.nextElementSibling ? word.nextElementSibling : word.parentNode!.children[0]) as HTMLElement;
    }

    protected switchWord(oldWord: HTMLElement, newWord: HTMLElement) {
        this.makeHidden(oldWord);
        this.makeVisible(newWord);
    }

    protected makeVisible(element: HTMLElement) {
        element.classList.remove(this.hiddenClassName);
        element.classList.add(this.visibleClassName);
    }

    protected makeHidden(element: HTMLElement) {
        element.classList.remove(this.visibleClassName);
        element.classList.add(this.hiddenClassName);
    }

    protected runAfter(duration: number, callable: () => any) {
        animate((timeFraction: number) => { return timeFraction }, (timePassed: number) => {
            if (this.#isStopped) {
                throw 'execution aborted';
            }

            if (timePassed !== 1) {
                return;
            }

console.debug('function is executed');
            callable();
        }, duration);
    }
}

class SingleLettersAnimatedHeadline extends AnimatedHeadline
{
    private readonly lettersDelay: number;
    protected readonly letterClassName = 'letter';

    constructor(element: HTMLElement, animationDelay: number = DefaultOptions.AnimationDelay, lettersDelay: number = DefaultOptions.LettersDelay) {
        super(element, animationDelay);

        this.lettersDelay = lettersDelay;
        this.rootElement.querySelectorAll(this.wordSelector).forEach(this.splitIntoSingleLetters, this);
    }

    protected next(word: HTMLElement = null) {
        word = word ?? this.current();
        const nextWord = this.getNextWord(word);
        const isHideWordIfLastLetter = word.querySelectorAll('.' + this.letterClassName).length >= nextWord.querySelectorAll('.' + this.letterClassName).length;

        this.hideLetter(word.querySelector('.' + this.letterClassName) as HTMLElement, word, isHideWordIfLastLetter);
        this.showLetter(nextWord.querySelector('.' + this.letterClassName) as HTMLElement, nextWord, !isHideWordIfLastLetter);
    }

    protected hideLetter(letter: HTMLElement, word: HTMLElement, isHideWordIfLastLetter: boolean) {
        this.hideOrShowLetter(letter, word, isHideWordIfLastLetter, true);
    }

    protected showLetter(letter: HTMLElement, word: HTMLElement, isHideWordIfLastLetter: boolean) {
        this.hideOrShowLetter(letter, word, isHideWordIfLastLetter, false);
    }

    protected hideOrShowLetter(letter: HTMLElement, word: HTMLElement, isHideWordIfLastLetter: boolean = true, isHide: boolean = false) {
        isHide ? this.makeHidden(letter) : this.makeVisible(letter);

        if (letter.nextElementSibling) {
            this.runAfter(this.lettersDelay, () => this.hideOrShowLetter(letter.nextElementSibling as HTMLElement, word, isHideWordIfLastLetter, isHide));
        } else if (isHideWordIfLastLetter) {
            this.runAfter(this.animationDelay, () => this.next(isHide ? this.getNextWord(word) : word));
        }
    }

    private splitIntoSingleLetters(word: Element) {
        const visibleClassName = this.visibleClassName;

        const letters = word.textContent!.split(''),
            selected = word.classList.contains(visibleClassName);
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
        (word as HTMLElement).style.opacity = "1";
    }
}

class TypeAnimatedHeadline extends SingleLettersAnimatedHeadline {
    #waitingClassName = 'waiting';
    #selectedClassName = 'selected';
    private readonly typeAnimationDelay;
    private readonly selectionDuration;

    constructor(element: HTMLElement, animationDelay: number = DefaultOptions.AnimationDelay, lettersDelay: number = DefaultOptions.LettersDelay, typeAnimationDelay: number = 1300, selectionDuration: number = 500) {
        super(element, animationDelay, lettersDelay);

        this.typeAnimationDelay = typeAnimationDelay;
        this.selectionDuration = selectionDuration;
    }

    protected resize() {
        // disable resizing
    }

    protected showWord(word: HTMLElement) {
        this.showLetter(word.querySelector('.' + this.letterClassName) as HTMLElement, word);
        this.makeVisible(word);
    }

    protected next(word: HTMLElement = null) {
        word = word ?? this.current();
        const nextWord = this.getNextWord(word);

        const parentSpan = word.parentNode as HTMLElement;
        parentSpan.classList.add(this.#selectedClassName);
        parentSpan.classList.remove(this.#waitingClassName);

        this.runAfter(this.selectionDuration, () => {
            parentSpan.classList.remove(this.#selectedClassName);
            this.makeHidden(word);
            word.querySelectorAll('.' + this.letterClassName).forEach((e) => {
                e.classList.remove(this.visibleClassName);
                e.classList.add(this.hiddenClassName);
            });
        });

        this.runAfter(this.typeAnimationDelay, () => this.showWord(nextWord));
    }

    protected showLetter(letter: HTMLElement, word: HTMLElement, isHideWordIfLastLetter = true) {
        super.showLetter(letter, word, isHideWordIfLastLetter);

        if (! letter.nextElementSibling) {
            this.runAfter(200, () => (word.parentNode as HTMLElement).classList.add(this.#waitingClassName));
        }
    }
}

class ClipAnimatedHeadline extends AnimatedHeadline { // @todo
    private readonly revealAnimationDelay;
    private readonly revealDuration;

    constructor(element: HTMLElement, animationDelay: number = DefaultOptions.AnimationDelay, revealAnimationDelay: number = 1500, revealDuration: number = 600) {
        super(element, animationDelay);

        this.revealAnimationDelay = revealAnimationDelay;
        this.revealDuration = revealDuration;
    }

    protected resize() {
        this.rootElement.style.width = String(this.rootElement.offsetWidth + 10);
    }

    protected showWord(word: HTMLElement) {
       let animation = (word.parentNode as HTMLElement).animate([{width: '2px'}, {width: word.offsetWidth + 'px' }], {duration: this.revealDuration});
       animation.onfinish= (e) => {
console.log('starting timer with ' + this.revealAnimationDelay);
            this.runAfter(this.revealAnimationDelay, () => this.next(word));
        };
    }

    protected next(word: HTMLElement = null) {
        super.next(word);

        word = word ?? this.current();
        const nextWord = this.getNextWord(word);

        let animation = (word.parentNode as HTMLElement).animate([{width: word.offsetWidth + 'px' }, {width: '2px'}], {duration: this.revealDuration});
        animation.onfinish= (e) => {
            this.switchWord(word, nextWord);
            this.showWord(nextWord);
        };
    }
}

class LoadingBarAnimatedHeadline extends AnimatedHeadline {
    readonly #loadingClassName = 'is-loading';
    private readonly barWaiting;

    constructor(element: HTMLElement, barAnimationDelay: number = 3800, barWaiting: number = 800) {
        super(element, barAnimationDelay);
        this.barWaiting = barWaiting;
    }

    protected init() {
        super.init();

        this.runAfter(this.barWaiting, () => this.rootElement.classList.add(this.#loadingClassName));
    }

    protected next(word: HTMLElement = null) {
        super.next(word);

        word = word ?? this.current();
        (word.parentNode as HTMLElement).classList.remove(this.#loadingClassName);
        this.runAfter(this.barWaiting, () => (word.parentNode as HTMLElement).classList.add(this.#loadingClassName));
    }
}