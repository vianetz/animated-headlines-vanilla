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
    <via-animated-headline animation="rotate-1">
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
<via-animated-headline animation="type" hold="3000" delay="1000">
```

| Option      | Description                                                                                                                       |
|-------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `animation` | The animation effect, one of: `rotate-1`, `rotate-2`, `rotate-3`, `type`, `loading-bar`, `slide`, `clip`, `zoom`, `scale`, `push` |
| `hold`      | Seconds to wait before starting a new animation cycle                                                                             |
| `delay`     | Seconds to delay the effect, e.g. typing or rotating                                                                              |

See also [demo source](demo/index.html) for a full list of options for all types.

## License

Animated Headlines is open-sourced software licensed under the [MIT license](https://opensource.org/license/MIT).