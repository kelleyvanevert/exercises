// for dynamic analysis
import { SandCastle } from "sandcastle";
import { parseScript } from "esprima";

// for static analysis
import { summarize } from "./lib/analyze";

export function handler(event, context) {
  const { sourceCode } = JSON.parse(event.body);

  let ast;
  try {
    ast = parseScript(sourceCode);
  } catch (e) {
    // error parsing the code
    return {
      statusCode: 200,
      body: JSON.stringify({
        err_parse: true,
        err: "could not parse"
      })
    };
  }

  let staticAnalysis = summarize(ast);

  return Promise.resolve({
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello Kelley ${Math.floor(Math.random() * 10)}`,
      sourceCode,
      ast,
      staticAnalysis
    })
  });

  // // const sandcastle = new SandCastle();
  // // const script = sandcastle.createScript(`
  // //   exports.main = function () {
  // //     ${sourceCode};
  // //     if (typeof result === "undefined") {
  // //       throw new Error("result variable not defined")
  // //     }
  // //     exit(result);
  // //   };
  // // `);

  // // return new Promise(resolve => {
  // //   script.on("exit", (err, output) => {
  // //     console.log("complete run", err ? err.message : "no error", output);
  // //     resolve({
  // //       statusCode: 200,
  // //       body: JSON.stringify({
  // //         err: err ? err.message : undefined,
  // //         passed_tests: !err,
  // //         ast,
  // //         staticAnalysis
  // //       })
  // //     });
  // //   });

  // //   script.run({});
  // // });
}
