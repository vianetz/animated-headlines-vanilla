/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

/** @see https://javascript.info/js-animation */
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

export default class AnimatedWordsElement extends HTMLElement {
    #isStopped = false;
    holdDelay: number = 2500;

    protected readonly wordSelector = 'b';

    connectedCallback() {
        this.holdDelay = this.hasAttribute('hold') ? parseInt(<string>this.getAttribute('hold')) : this.holdDelay;
        this.resize();

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (! prefersReducedMotion) {
            this.start();
        }
    }

    attributeChangedCallback() {
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
        this.runAfter(this.holdDelay, () => this.next());
    }

    /** @api */
    public stop() {
        this.#isStopped = true;
    }

    /** @api */
    public current(): HTMLElement|null {
        const visibleElement = this.querySelector(this.wordSelector + ':not([hidden])') as HTMLElement;

        return visibleElement ?? this.querySelector(this.wordSelector); // simply select the first word by default
    }

    // main logic
    protected next(word: HTMLElement|null = null) {
        word = word ?? this.current();
        if (word === null) {
            return;
        }

        const nextWord = this.getNextWord(word);

        this.switchWord(word, nextWord);
        this.runAfter(this.holdDelay, () => this.next(nextWord));
    }

    protected getNextWord(word: HTMLElement) {
        return (word.nextElementSibling ? word.nextElementSibling : word.parentNode!.children[0]) as HTMLElement;
    }

    protected switchWord(oldWord: HTMLElement, newWord: HTMLElement) {
        this.makeHidden(oldWord);
        this.makeVisible(newWord);
    }

    protected makeVisible(element: HTMLElement) {
        element.removeAttribute('hidden');
    }

    protected makeHidden(element: HTMLElement) {
        element.setAttribute('hidden', '');
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
customElements.define('via-animated-words-headline', AnimatedWordsElement);