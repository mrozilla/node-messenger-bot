// =============================================================================
// Listen to events
// =============================================================================

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', text => processMessage(text));

// =============================================================================
// Process message
// =============================================================================

async function processMessage(text) {
  await sendMessage(`"${text.trim()}" translates to meowish 🐈💬 as:`);
  await sendMessage(translateToMeowish(text));
}

// =============================================================================
// Translate to meowish
// =============================================================================

function translateToMeowish(str) {
  if (str.length === 0) {
    return 'Meow!';
  }

  const re = /[^\r\n.!?]+(:?(:?\r\n|[\r\n]|[.!?])+|$)/gi;
  const sentenceArray = str.trim().match(re);

  function meowifyWords(str) {
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

  return sentenceArray
    .map(sentence => {
      const punctuation = ['.', '?', '!'];
      if (punctuation.some(char => sentence.charAt(sentence.length - 1).indexOf(char) >= 0)) {
        return meowifyWords(sentence) + sentence.charAt(sentence.length - 1);
      } else {
        return meowifyWords(sentence);
      }
    })
    .join(' ');
}

function done() {
  console.log('Bye!');
  process.exit();
}

// =============================================================================
// Send message
// =============================================================================

function sendMessage(message) {
  // fake async
  return new Promise(resolve => {
    resolve(console.log(message));
  });
}
