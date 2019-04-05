import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { IExerciseType } from "../exercises";

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

interface IProps {
  exercise: IExercise;
  savedAnswer?: IAnswer;
  onAttempt: (answer: IAnswer) => void;
}

interface IState {
  code: string;
}

export const simpleCodeEval: IExerciseType<IAnswer, IResult, IExercise> = {
  StatementRenderer: class extends React.Component<IProps, IState> {
    constructor(props: IProps) {
      super(props);
      this.state = {
        code: props.savedAnswer || ""
      };
    }

    onSubmit = (e: any) => {
      e.preventDefault();
      this.props.onAttempt(this.state.code);
    };

    onCodeChange = (e: any) => {
      this.setState({
        code: e.target.value
      });
    };

    render() {
      const {
        exercise: { description }
      } = this.props;

      return (
        <div>
          <ReactMarkdown source={description} />
          <form onSubmit={this.onSubmit}>
            <textarea
              name="code"
              value={this.state.code}
              onChange={this.onCodeChange}
            />
            <button>Submit</button>
          </form>
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
  },

  ResultRenderer({ result }) {
    if (result.noErrors) {
      return (
        <div>Your code evaluated to: {JSON.stringify(result.computed)}</div>
      );
    } else {
      return <div>Your code did not parse or compute.</div>;
    }
  }
};
