export default interface IEvaluation<IResult> {
  // some particular kind of result
  result: IResult;

  // whether or not the student is "allowed" to continue
  // to the next exercise
  passed: boolean;
}
