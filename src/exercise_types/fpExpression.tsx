import classNames from "classnames";
import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { IExerciseRenderer, IExerciseType } from "../exercises";

type markdown = string;

type IAnswer = string; // JavaScript expression

interface IResult {
  parseError?: string;
  ast: any;
  staticAnalysis: {
    [what: string]: number;
  };

  runtimeError?: string;
  result?: any;
}

interface IExerciseSet {
  data: string;
  exercises: Array<{
    question: markdown;
    compute: string;
  }>;
}

interface IExercise {
  data: string;
  question: markdown;
  compute: string;
}

type IProps = React.ComponentProps<
  IExerciseRenderer<IAnswer, IResult, IExercise>
>;

interface IState {
  code: string;
}

export const fpExpression: IExerciseType<
  IAnswer,
  IResult,
  IExercise,
  IExerciseSet
> = {
  id: "fp_expression",

  expand({ data, exercises }) {
    return exercises.map(exercise => ({ ...exercise, data }));
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
      this.setState({
        code: e.target.value
      });
    };

    retry = () => {
      const { onRetry } = this.props;
      onRetry();
    };

    renderEvaluation() {
      const { evaluation } = this.props;
      if (evaluation) {
        const {
          result: { parseError, runtimeError, result },
          passed
        } = evaluation;

        return (
          <div>
            {parseError ? (
              <p>
                Your code did not parse: <em>{parseError}</em>
              </p>
            ) : null}
            {runtimeError ? (
              <p>
                Your code did not compute: <em>{runtimeError}</em>
              </p>
            ) : null}
            {!parseError && !runtimeError ? (
              <div
                className={classNames({
                  alert: true,
                  "alert-success": passed,
                  "alert-danger": !passed
                })}
                role="alert"
              >
                Your code evaluated to: {JSON.stringify(result)}
              </div>
            ) : null}
            <p>
              <button
                type="button"
                className="btn btn-link"
                onClick={this.retry}
              >
                {passed ? "Clear" : "Try again"}
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
              disabled={!!evaluation}
              value={this.state.code}
              onChange={this.onCodeChange}
            />
          </div>
          {evaluation ? (
            this.renderEvaluation()
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.check}
            >
              Check now
            </button>
          )}
        </div>
      );
    }
  },

  /*
  async evaluate({ answer: jsExpression, exercise }) {
    const response = await fetch("https://powerful-mesa-60229.herokuapp.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sourceCode: `${exercise.data}; let result = (${jsExpression});`
      })
    });
    const {
      err_parse,
      err,
      ast,
      output,
      staticAnalysis
    } = await response.json();

    const result: IResult = { ast, staticAnalysis, result: output };

    if (err_parse) {
      result.parseError = err;
    } else if (err) {
      result.runtimeError = err;
    }

    return {
      result,
      passed:
        !result.parseError &&
        !result.runtimeError &&
        // tslint:disable-next-line:no-eval
        result.result === eval(`${exercise.data}; ${exercise.compute}`)
    };
  }
*/

  async evaluate({ answer: jsExpression, exercise }) {
    const base = {
      ast: null,
      staticAnalysis: {}
    };

    try {
      const result: IResult = {
        ...base,

        // tslint:disable-next-line:no-eval
        result: eval(`${exercise.data}; ${jsExpression}`)
      };

      return {
        result,
        passed:
          !result.parseError &&
          !result.runtimeError &&
          // tslint:disable-next-line:no-eval
          result.result === eval(`${exercise.data}; ${exercise.compute}`)
      };
    } catch (e) {
      return {
        result: {
          ...base,
          parseError: e.message
        },
        passed: false
      };
    }
  }
};
