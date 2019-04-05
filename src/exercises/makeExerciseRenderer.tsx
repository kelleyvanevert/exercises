import * as React from "react";
import IEvaluation from "./IEvaluation";
import IExerciseRenderer from "./IExerciseRenderer";
import IExerciseType from "./IExerciseType";

export function makeExerciseRenderer<IAnswer, IResult, IStatement>(
  ExerciseType: IExerciseType<IAnswer, IResult, IStatement>
): IExerciseRenderer<IAnswer, IResult, IStatement> {
  interface IState {
    evaluation?: IEvaluation<IResult>;
  }

  return class extends React.Component<
    {
      exercise: IStatement;
      savedAnswer: IAnswer;
      onPass: () => void;
      onSave: (answer: IAnswer) => Promise<boolean>;
    },
    IState
  > {
    state: IState = {};

    tryAgain = () => {
      this.setState({ evaluation: undefined });
    };

    onAttempt = async (answer: IAnswer) => {
      const { exercise } = this.props;

      // save before attempt
      this.props.onSave(answer);

      // evaluate
      const evaluation = await ExerciseType.evaluate({
        answer,
        exercise
      });
      this.setState({
        evaluation
      });

      // possibly pass
      if (evaluation.passed) {
        this.props.onPass();
      }
    };

    render() {
      const { exercise, savedAnswer } = this.props;
      const { evaluation } = this.state;
      if (evaluation) {
        const { result, passed } = evaluation;
        return (
          <div>
            <ExerciseType.ResultRenderer result={result} />
            <div>
              {passed ? (
                "PASSED"
              ) : (
                <a href="#" onClick={this.tryAgain}>
                  try again
                </a>
              )}
            </div>
          </div>
        );
      } else {
        return (
          <ExerciseType.StatementRenderer
            exercise={exercise}
            savedAnswer={savedAnswer}
            onAttempt={this.onAttempt}
          />
        );
      }
    }
  };
}
