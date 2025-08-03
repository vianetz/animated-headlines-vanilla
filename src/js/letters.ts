/**!
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import AnimatedWordsElement from "./words";

export default class AnimatedSingleLettersElement extends AnimatedWordsElement {
    lettersDelay: number = 50;
    protected readonly letterClassName = 'letter';

    connectedCallback() {
        super.connectedCallback();

        this.lettersDelay = this.hasAttribute('delay') ? parseInt(<string>this.getAttribute('delay')) : this.lettersDelay;
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
            this.runAfter(this.holdDelay, () => this.next(isHide ? this.getNextWord(word) : word));
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
customElements.define('via-animated-letters-headline', AnimatedSingleLettersElement);
