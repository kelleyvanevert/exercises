import IEvaluation from "./IEvaluation";

export default interface IExerciseType<IAnswer, IResult, IStatement> {
  StatementRenderer: React.ComponentType<{
    statement: IStatement;
    savedAnswer?: IAnswer;
    onAttempt: (answer: IAnswer) => void;
  }>;

  evaluate: (attempt: {
    answer: IAnswer;
    statement: IStatement;
  }) => Promise<IEvaluation<IResult>>;

  ResultRenderer: React.ComponentType<{ result: IResult }>;
}
