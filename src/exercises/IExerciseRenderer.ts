export type IExerciseRenderer<
  IAnswer,
  IResult,
  IStatement
> = React.ComponentType<{
  exercise: IStatement;
  savedAnswer: IAnswer;
  onPass: () => void;
  onSave: (answer: IAnswer) => Promise<boolean>;
}>;

export default IExerciseRenderer;
