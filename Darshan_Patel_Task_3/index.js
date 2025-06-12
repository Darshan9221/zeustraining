let ans = [];

function factorial(n) {
  let arr = [1];
  if (n === 0 || n === 1) {
    return [1];
  }

  for (let i = 2; i <= n; i++) {
    let carry = 0;
    for (let j = 0; j < arr.length; j++) {
      let product = arr[j] * i + carry;
      arr[j] = product % 100000;
      carry = Math.floor(product / 100000);
    }
    while (carry > 0) {
      arr.push(carry % 100000);
      carry = Math.floor(carry / 100000);
    }
  }
  arr.reverse();
  return arr;
}

let num = 700;
ans = factorial(num);
let str =
  ans[0].toString() +
  ans
    .slice(1)
    .map((x) => x.toString().padStart(5, "0"))
    .join("");
console.log(`Factorial of ${num} is ${str}`);

// for (let i = 0; i <= 1000; i++) {
//   ans = factorial(i);
//   let str = ans.join("");
//   console.log(`Factorial of ${i} is ${str}`);
// }

// console.log(factorial(1000).length);
