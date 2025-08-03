/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

// @todo split into separate files

export enum AnimationType {
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

function createAnimatedHeadline(animationType: AnimationType, props: { [key: string]: string|null } = {}): AnimatedWordsElement {
    let element;

    switch (animationType) {
        case AnimationType.Clip:
            element = document.createElement('via-animated-headline-clip') as ClipAnimatedWordsElement;
            break;
        case AnimationType.LoadingBar:
            element = document.createElement('via-animated-headline-loading') as LoadingBarAnimatedWordsElement;
            break;
        case AnimationType.Push:
        case AnimationType.Slide:
        case AnimationType.Rotate1:
        case AnimationType.Zoom:
            element = document.createElement('via-animated-headline-words') as AnimatedWordsElement;
            break;
        case AnimationType.Scale:
        case AnimationType.Rotate2:
        case AnimationType.Rotate3:
            element = document.createElement('via-animated-headline-letters') as AnimatedSingleLettersElement;
            break;
        case AnimationType.Type:
            element = document.createElement('via-animated-headline-type') as TypeAnimatedWordsElement;
            break;
        default:
            throw 'invalid animation type ' + animationType + ' (must be one of ' + Object.values(AnimationType) + ')';
    }

    // copy attributes to child
    for (const [key, value] of Object.entries(props)) {
        element.setAttribute(key, value ?? '');
    }

    return element;
}

class AnimatedHeadline extends HTMLElement {
    static get observedAttributes() {
        return ['type', 'delay']; // @todo add missing attributes
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const animationType = this.getAttribute('type') as AnimationType;

        // collect all attributes except 'type'
        const forwardedAttrs: { [key: string]: string|null } = {};
        for (const attr of this.attributes) {
          if (attr.name !== 'type') {
            forwardedAttrs[attr.name] = attr.value;
          }
        }

        const wrapper = createAnimatedHeadline(animationType, forwardedAttrs);
        // re-add the inner contents of the element
        Array.from(this.children).forEach(child => {
            if (child.tagName?.startsWith('VIA-ANIMATED-HEADLINE')) {
                child.childNodes.forEach(n => wrapper.appendChild(n.cloneNode(true)));
            } else {
                wrapper.appendChild(child.cloneNode(true));
            }
        });

        // @ts-ignore
        this.innerHTML = '';
        // @ts-ignore
        this.appendChild(wrapper);
    }
}
customElements.define('via-animated-headline', AnimatedHeadline);

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

class AnimatedWordsElement extends HTMLElement {
    #isStopped = false;
    animationDelay: number = DefaultOptions.AnimationDelay;

    protected readonly wordSelector = 'b';
    protected readonly visibleClassName = 'is-visible';
    protected readonly hiddenClassName = 'is-hidden'; // @todo use hidden attribute instead

    connectedCallback() {
        this.init();
        this.start();
    }

    attributeChangedCallback() {
        this.resize();
    }

    protected init() {
        this.animationDelay = this.hasAttribute('delay') ? parseInt(<string>this.getAttribute('delay')) : this.animationDelay;
        this.resize();
    }
    
    protected resize() {
        let width = 0;
        // assign to wrapper element the width of its longest word
        this.querySelectorAll(this.wordSelector).forEach(function (e) {
            width = Math.max((e as HTMLElement).offsetWidth, width);
        });

        this.style.width = width.toString();
    }

    /** @api */
    public start() {
        this.#isStopped = false;
        this.runAfter(this.animationDelay, () => this.next());
    }

    /** @api */
    public stop() {
        this.#isStopped = true;
    }

    /** @api */
    public current(): HTMLElement|null {
        const visibleElement = this.querySelector(this.wordSelector + '.' + this.visibleClassName) as HTMLElement;

        return visibleElement ?? this.querySelector(this.wordSelector);
    }

    // main logic
    protected next(word: HTMLElement|null = null) {
        word = word ?? this.current();
        if (word === null) {
            return;
        }

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

            callable();
        }, duration);
    }
}
customElements.define('via-animated-headline-words', AnimatedWordsElement);

class AnimatedSingleLettersElement extends AnimatedWordsElement {
    lettersDelay: number = DefaultOptions.LettersDelay;
    protected readonly letterClassName = 'letter';

    protected init() {
        super.init();
        this.lettersDelay = this.hasAttribute('letters-delay') ? parseInt(<string>this.getAttribute('letters-delay')) : this.lettersDelay;
    }

    connectedCallback() {
        super.connectedCallback();
        this.querySelectorAll(this.wordSelector).forEach(this.splitIntoSingleLetters, this);
    }

    protected next(word: HTMLElement|null = null) {
        word = word ?? this.current();
        if (word === null) {
            return;
        }

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
customElements.define('via-animated-headline-letters', AnimatedSingleLettersElement);

class TypeAnimatedWordsElement extends AnimatedSingleLettersElement {
    #waitingClassName = 'waiting';
    #selectedClassName = 'selected';
    selectionDuration= 500;

    protected init() {
        super.init();
        this.selectionDuration = this.hasAttribute('selection-duration') ? parseInt(<string>this.getAttribute('selection-duration')) : this.selectionDuration;
    }

    protected resize() {
        // disable resizing
    }

    protected showWord(word: HTMLElement) {
        this.showLetter(word.querySelector('.' + this.letterClassName) as HTMLElement, word);
        this.makeVisible(word);
    }

    protected next(word: HTMLElement|null = null) {
        word = word ?? this.current();
        if (word === null) {
            return;
        }

        const nextWord = this.getNextWord(word);

        const parentSpan = word.parentNode as HTMLElement;
        parentSpan.classList.add(this.#selectedClassName);
        parentSpan.classList.remove(this.#waitingClassName);

        this.runAfter(this.selectionDuration, () => {
            parentSpan.classList.remove(this.#selectedClassName);
            this.makeHidden(word);
            word.querySelectorAll('.' + this.letterClassName).forEach((e) => {
                this.makeHidden(e as HTMLElement);
            });
        });

        this.runAfter(this.animationDelay, () => this.showWord(nextWord));
    }

    protected showLetter(letter: HTMLElement, word: HTMLElement, isHideWordIfLastLetter = true) {
        super.showLetter(letter, word, isHideWordIfLastLetter);

        if (! letter.nextElementSibling) {
            this.runAfter(200, () => (word.parentNode as HTMLElement).classList.add(this.#waitingClassName));
        }
    }
}
customElements.define('via-animated-headline-type', TypeAnimatedWordsElement);

class ClipAnimatedWordsElement extends AnimatedWordsElement {
    revealDuration= 600;

    protected init() {
        super.init();
        this.revealDuration = this.hasAttribute('reveal-duration') ? parseInt(<string>this.getAttribute('reveal-duration')) : this.revealDuration;
    }

    protected resize() {
        this.style.width = String(this.offsetWidth + 10);
    }

    protected showWord(word: HTMLElement) {
       let animation = (word.parentNode as HTMLElement).animate([{width: '2px'}, {width: word.offsetWidth + 'px' }], {duration: this.revealDuration});
       animation.onfinish = (e) => this.runAfter(this.animationDelay, () => this.next(word));
    }

    protected next(word: HTMLElement|null = null) {
        word = word ?? this.current();
        if (word === null) {
            return;
        }

        const nextWord = this.getNextWord(word);

        let animation = (word.parentNode as HTMLElement).animate([{width: word.offsetWidth + 'px' }, {width: '2px'}], {duration: this.revealDuration});
        animation.onfinish = (e) => {
            this.switchWord(word, nextWord);
            this.showWord(nextWord);
        };
    }
}
customElements.define('via-animated-headline-clip', ClipAnimatedWordsElement);

class LoadingBarAnimatedWordsElement extends AnimatedWordsElement {
    readonly #loadingClassName = 'is-loading';
    barWaiting = 800;

    protected init() {
        super.init();

        this.barWaiting = this.hasAttribute('bar-waiting') ? parseInt(<string>this.getAttribute('bar-waiting')) : this.barWaiting;
        this.runAfter(this.barWaiting, () => this.classList.add(this.#loadingClassName));
    }

    protected next(word: HTMLElement|null = null) {
        super.next(word);

        word = word ?? this.current();
        if (word === null) {
            return;
        }

        (word.parentNode as HTMLElement).classList.remove(this.#loadingClassName);
        this.runAfter(this.barWaiting, () => (word.parentNode as HTMLElement).classList.add(this.#loadingClassName));
    }
}
customElements.define('via-animated-headline-loading', LoadingBarAnimatedWordsElement);