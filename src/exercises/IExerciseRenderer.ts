export type IExerciseRenderer<
  IAnswer,
  IResult,
  IExercise
> = React.ComponentType<{
  exercise: IExercise;
  savedAnswer: IAnswer;
  onPass: () => void;
  onSave: (answer: IAnswer) => Promise<boolean>;
}>;

export default IExerciseRenderer;
