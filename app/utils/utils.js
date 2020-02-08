/// utility

// random by choices and probability

function random_by_choice(n, props) {
  var rnd = Math.random();
  var sum = 0.0;
  for (var i = 0; i < n; i++) {
    sum += props[i];
    if (rnd <= sum) {
      return i;
    }
  }
  return n - 1;
}

function slice_2d_array(arr, stX, enX, stY, enY) {
  var res = [];
  for (var i = stX; i < enX; i++) {
    res.push(arr[i].slice(stY, enY));
  }
  return res;
}

// shuffle array

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
