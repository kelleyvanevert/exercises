import classNames from "classnames";
import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { IExerciseRenderer, IExerciseType } from "../exercises";

type markdown = string;

type IAnswer = string; // code

interface IResult {
  noErrors: boolean; // no parse errors or exceptions
  computed?: any;
}

interface IExercise {
  description: markdown;
  correctResult: any;
}

type IProps = React.ComponentProps<
  IExerciseRenderer<IAnswer, IResult, IExercise>
>;

interface IState {
  code: string;
}

export const simpleCodeEval: IExerciseType<IAnswer, IResult, IExercise> = {
  id: "simple_eval",

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
      this.setState({
        code: ""
      });
      onRetry();
    };

    renderEvaluation() {
      const { evaluation } = this.props;
      if (evaluation) {
        const {
          result: { noErrors, computed },
          passed
        } = evaluation;

        if (!noErrors) {
          return <p>Your code did not compute</p>;
        } else {
          return (
            <div>
              <div
                className={classNames({
                  alert: true,
                  "alert-success": passed,
                  "alert-danger": !passed
                })}
                role="alert"
              >
                Your code evaluated to: {JSON.stringify(computed)}
              </div>
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
      }

      return null;
    }

    render() {
      const {
        exercise: { description },
        evaluation
      } = this.props;

      return (
        <div>
          <ReactMarkdown source={description} />
          <div className="form-group">
            <textarea
              className="form-control"
              rows={3}
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

  async evaluate({ answer, exercise: { correctResult } }) {
    try {
      // tslint:disable-next-line:no-eval
      const computed = eval(answer);
      return {
        result: {
          noErrors: true,
          computed
        },
        passed: computed === correctResult
      };
    } catch (__) {
      // parsing or computation failed
    }

    return {
      result: {
        noErrors: false
      },
      passed: false
    };
  }
};
