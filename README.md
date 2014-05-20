# twZip.js

## How to build ?

* use `make db` get pre-built folders with needed information of zipcodes.

## How to use ?

Inject needed scripts first (jQuery needed)

```html
<script src="jquery.min.js"></script>
<script src="twZip.js"></script>
```

Initialize TwZip

```javascript
var twZip = new TwZip();
```

Search on the fly

```javascript
twZip.search('台北市', function(data) {
  console.log(data);
});
```

## Author

EragonJ (Chia-Lung, Chen)

Email: eragonj@eragonj.me

## License

MIT
