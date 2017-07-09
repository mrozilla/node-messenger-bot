process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(text) {
  console.log(`This translates to meowish 🐈  as:`);
  console.log(translateToMeowish(text));
  if (text === 'quit') {
    done();
  }
});

function translateToMeowish(str) {
  if (str.length === 0) {
    return 'Meow!';
  }
  return str
    .trim()
    .split(' ')
    .map(word => {
      const letters = [['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], ['i', 'k', 'l', 'm', 'n', 'o', 'p', 'q'], ['r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']];
      if (letters[0].some(char => word.charAt(0).toLowerCase().indexOf(char) >= 0)) {
        return 'meow';
      } else if (letters[1].some(char => word.charAt(0).toLowerCase().indexOf(char) >= 0)) {
        return 'miau';
      } else if (letters[2].some(char => word.charAt(0).toLowerCase().indexOf(char) >= 0)) {
        return 'purr';
      } else {
        return word;
      }
    })
    .join(' ');
}

function done() {
  console.log('Bye!');
  process.exit();
}
