import * as React from "react";
import IEvaluation from "./IEvaluation";

type ExerciseRenderer<IAnswer, IResult, IExercise> = React.ComponentType<{
  exercise: IExercise;
  savedAnswer?: IAnswer;
  evaluation?: IEvaluation<IResult>;
  onAttempt: (answer: IAnswer) => void;
  onRetry: () => void;
}>;

export default ExerciseRenderer;
