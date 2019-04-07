import classNames from "classnames";
import { parseScript } from "esprima";
import * as equal from "fast-deep-equal";
import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { IEvaluation, IExerciseRenderer, IExerciseType } from "../exercises";

type markdown = string;

type IAnswer = string; // JavaScript expression

interface IParseErrorResult {
  parseError: string;
}

interface IParsedResult {
  ast: any;
  staticAnalysis: {
    [what: string]: number;
  };
  feedback: string[];
}

interface IRuntimeErrorResult extends IParsedResult {
  runtimeError: string;
}

interface IComputedResult extends IParsedResult {
  computed: any;
}

type IResult = IParseErrorResult | IRuntimeErrorResult | IComputedResult;

interface IExerciseSet {
  data: string;
  exercises: Array<{
    question: markdown;
    compute: string;
  }>;
  whitelistVariables?: string[];
}

interface IExercise {
  data: string;
  question: markdown;
  compute: string;

  whitelistVariables?: string[];
  blacklistAnswers?: string[];
}

type IProps = React.ComponentProps<
  IExerciseRenderer<IAnswer, IResult, IExercise>
>;

interface IState {
  code: string;
  quickEval?: IEvaluation<IResult>;
}

export const fpExpression: IExerciseType<
  IAnswer,
  IResult,
  IExercise,
  IExerciseSet
> = {
  id: "fp_expression",

  expand({ exercises, ...other }) {
    return exercises.map(exercise => ({ ...exercise, ...other }));
  },

  ExerciseRenderer: class extends React.Component<IProps, IState> {
    constructor(props: IProps) {
      super(props);
      this.state = {
        code: props.savedAnswer || ""
      };
    }

    check = () => {
      this.props.onAttempt(this.state.code);
    };

    onCodeChange = (e: any) => {
      const code = e.target.value;
      this.setState({ code });
      this.quickEval(code);
    };

    async quickEval(code: IAnswer) {
      const { exercise } = this.props;
      const quickEval = await fpExpression.evaluate({ exercise, answer: code });
      this.setState({ quickEval });
      if (quickEval.passed) {
        this.props.onAttempt(code);
      }
    }

    retry = () => {
      const { onRetry } = this.props;
      onRetry();
    };

    renderResult = (
      { result, passed }: IEvaluation<IResult>,
      quick = false
    ) => {
      return (
        <div>
          {"parseError" in result ? (
            <p>
              Your code did not parse: <em>{result.parseError}</em>
            </p>
          ) : null}
          {"runtimeError" in result ? (
            <p>
              Your code did not compute: <em>{result.runtimeError}</em>
            </p>
          ) : null}
          {"ast" in result ? (
            <>
              {result.feedback.length > 0 ? (
                <ul>
                  {result.feedback.map((item, i) => (
                    <li key={i}>
                      <ReactMarkdown source={item} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}
          {"computed" in result ? (
            <>
              <div
                className={classNames({
                  alert: true,
                  "alert-success": passed && !quick,
                  "alert-danger": !passed && !quick,
                  "alert-secondary": quick
                })}
                role="alert"
              >
                {result.computed === undefined
                  ? `undefined`
                  : typeof result.computed === "function"
                  ? result.computed.toString()
                  : JSON.stringify(result.computed)}
              </div>
            </>
          ) : null}
          {/*"ast" in result ? (
            <code>
              <pre>{JSON.stringify(result.ast, null, 2)}</pre>
            </code>
          ) : null*/}
        </div>
      );
    };

    renderQuickEval() {
      const { quickEval } = this.state;
      if (quickEval) {
        return this.renderResult(quickEval, true);
      }
      return null;
    }

    renderEvaluation() {
      const { evaluation } = this.props;
      if (evaluation) {
        return (
          <div>
            {this.renderResult(evaluation)}
            <p>
              <button
                type="button"
                className="btn btn-link"
                onClick={this.retry}
              >
                Try again
              </button>
            </p>
          </div>
        );
      }

      return null;
    }

    render() {
      const {
        exercise: { question, data },
        evaluation
      } = this.props;

      return (
        <div>
          <ReactMarkdown source={question} />
          <ReactMarkdown
            source={`\`\`\`js
${data}
\`\`\``}
          />
          <div className="form-group">
            <input
              className="form-control"
              name="code"
              autoComplete="off"
              disabled={!!evaluation}
              value={this.state.code}
              onChange={this.onCodeChange}
            />
          </div>
          {this.renderQuickEval()}
          {evaluation
            ? this.renderEvaluation()
            : null /*(
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.check}
            >
              Check now
            </button>
          )*/}
        </div>
      );
    }
  },

  async evaluate({ answer: jsExpression, exercise }) {
    try {
      const result: IParsedResult = {
        ast: parseScript(jsExpression),
        staticAnalysis: {},
        feedback: []
      };

      if (
        result.ast.body.length !== 1 ||
        result.ast.body[0].type !== "ExpressionStatement"
      ) {
        result.feedback.push(
          `This doesn't seem to be a single JavaScript _expression_!`
        );
      }

      let blacklisted = false;
      try {
        blacklisted = (exercise.blacklistAnswers || []).some(notAllowed =>
          equal(parseScript(notAllowed), result.ast)
        );
        if (blacklisted) {
          result.feedback.push(`This answer is blacklisted!`);
        }
      } catch {
        //
      }

      try {
        // tslint:disable-next-line:no-eval
        const computed = eval(`${exercise.data}; ${jsExpression}`);

        return {
          result: {
            ...result,
            computed
          },
          passed:
            !blacklisted &&
            // tslint:disable-next-line:no-eval
            computed === eval(`${exercise.data}; ${exercise.compute}`)
        };
      } catch (e) {
        return {
          result: {
            ...result,
            runtimeError: e.message
          },
          passed: false
        };
      }
    } catch (e) {
      return {
        result: {
          parseError: e.message
        },
        passed: false
      };
    }
  }
};
