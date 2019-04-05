import IEvaluation from "./IEvaluation";
import IExerciseRenderer from "./IExerciseRenderer";

export default interface IExerciseType<IAnswer, IResult, IExercise> {
  id: string;

  prepare?: (exercise: IExercise) => Promise<IExercise>;

  ExerciseRenderer: IExerciseRenderer<IAnswer, IResult, IExercise>;

  evaluate: (attempt: {
    exercise: IExercise;
    answer: IAnswer;
  }) => Promise<IEvaluation<IResult>>;
}
