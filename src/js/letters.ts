/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
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
        this.switchWord(word, nextWord);
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

    private splitIntoSingleLetters(word: HTMLElement): void {
        const letterElements: Element[] = [];

        for (const child of word.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) { // either the child is a text -> then split into letters
                const letters = child.textContent!.split('');
                for (let i in letters) {
                    const element = document.createElement('span');
                    element.innerHTML = letters[i];
                    letterElements.push(element);
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) { // otherwise if it is an element -> use as letter
                letterElements.push((child as Element));
            } else {
                console.warn('unsupported child node:', child);
            }
        }

        letterElements.forEach(letter => {
            letter.classList.add(this.letterClassName);
            if (word.hasAttribute('hidden')) {
                letter.setAttribute('hidden', '');
            }
        });

        word.innerHTML = letterElements.map((element) => element.outerHTML).join('');
        word.style.opacity = "1";
    }
}
customElements.define('via-animated-letters-headline', AnimatedSingleLettersElement);
