/**!
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import AnimatedSingleLettersElement from "./letters";

export default class TypeAnimatedWordsElement extends AnimatedSingleLettersElement {
    #waitingClassName = 'waiting';
    #selectedClassName = 'selected';
    selectionDuration= 500;

    connectedCallback() {
        super.connectedCallback();

        this.selectionDuration = this.hasAttribute('selection') ? parseInt(<string>this.getAttribute('selection')) : this.selectionDuration;
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
            word.querySelectorAll('.' + this.letterClassName).forEach((e) => this.makeHidden(e as HTMLElement));
        });

        this.runAfter(this.selectionDuration * 2, () => this.showWord(nextWord));
    }

    protected showLetter(letter: HTMLElement, word: HTMLElement, isHideWordIfLastLetter = true) {
        super.showLetter(letter, word, isHideWordIfLastLetter);

        if (! letter.nextElementSibling) {
            this.runAfter(200, () => (word.parentNode as HTMLElement).classList.add(this.#waitingClassName));
        }
    }
}
customElements.define('via-animated-type-headline', TypeAnimatedWordsElement);