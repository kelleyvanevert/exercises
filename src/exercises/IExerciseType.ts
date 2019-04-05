import IEvaluation from "./IEvaluation";

export default interface IExerciseType<IAnswer, IResult, IExercise> {
  StatementRenderer: React.ComponentType<{
    exercise: IExercise;
    savedAnswer?: IAnswer;
    onAttempt: (answer: IAnswer) => void;
  }>;

  evaluate: (attempt: {
    answer: IAnswer;
    exercise: IExercise;
  }) => Promise<IEvaluation<IResult>>;

  ResultRenderer: React.ComponentType<{ result: IResult }>;
}
