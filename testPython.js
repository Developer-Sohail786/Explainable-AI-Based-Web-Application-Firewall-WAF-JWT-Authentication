import { spawnSync } from "child_process";

const payload = "<script>alert(1)</script>";

const result = spawnSync(
  "py",
  [
    "ML/predict.py",
    payload
  ],
  {
    encoding: "utf-8"
  }
);

console.log("STDOUT:");
console.log(result.stdout);

console.log("STDERR:");
console.log(result.stderr);