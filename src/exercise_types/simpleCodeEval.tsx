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
          const color = passed ? "green" : "red";
          return (
            <div>
              <p style={{ color }}>
                Your code evaluated to: {JSON.stringify(computed)}
              </p>
              {passed ? (
                <p>
                  <button onClick={this.retry}>Try again</button>
                </p>
              ) : null}
            </div>
          );
        }
      }

      return null;
    }

    render() {
      const {
        exercise: { description }
      } = this.props;

      return (
        <div>
          <ReactMarkdown source={description} />
          <textarea
            name="code"
            value={this.state.code}
            onChange={this.onCodeChange}
          />
          <button onClick={this.check}>Check</button>
          {this.renderEvaluation()}
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
