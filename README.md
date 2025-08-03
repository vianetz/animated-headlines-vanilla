# Animated Headlines with Vanilla JavaScript

Animated Headlines with interchangeable words that replace one another through CSS transitions.  
See [demo](https://vianetz.github.io/animated-headlines-vanilla/).

## Installation

### npm

```bash
npm install @vianetz/animated-headlines-vanilla
```

### bower
```bash
bower install @vianetz/animated-headlines-vanilla
```

## Default Usage

Include the CSS and JavaScript in your head:

```html
<link rel="stylesheet" src="dist/animated-headline.css">
<script src="dist/animated-headline.js" defer></script>
```

Then use the following markup:

```html
<h1>
    My favorite food is
    <via-animated-headline type="rotate-1">
        <b class="is-visible">pizza</b>
        <b>sushi</b>
        <b>steak</b>
    </span>
</h1>
```

## Advanced Usage


## Options

The animated headline component provides multiple options to customize different animation settings depending on the type, e.g.:

```html
<via-animated-headline type="type" delay="3000" letters-delay="1000">
```

See the [demo source](demo/index.html) for a full list of options for all types.

## License

Animated Headlines is open-sourced software licensed under the [MIT license](https://opensource.org/license/MIT).