import IEvaluation from "./IEvaluation";
import IExerciseRenderer from "./IExerciseRenderer";

export default interface IExerciseType<
  IAnswer,
  IResult,
  IExercise,
  IExerciseSet = null
> {
  id: string;

  expand?: (exerciseSet: IExerciseSet) => IExercise[];

  prepare?: (exercise: IExercise) => Promise<IExercise>;

  ExerciseRenderer: IExerciseRenderer<IAnswer, IResult, IExercise>;

  evaluate: (attempt: {
    exercise: IExercise;
    answer: IAnswer;
  }) => Promise<IEvaluation<IResult>>;
}
