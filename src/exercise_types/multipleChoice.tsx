import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { IExerciseType } from "../exercises";

type markdown = string;

export function makeMultipleChoiceExerciseType<IAnswer>(
  AnswerRenderer: React.SFC<{ answer: IAnswer }>
): IExerciseType<
  IAnswer,
  boolean,
  {
    question: markdown;
    options: IAnswer[];
    correctIndex: number;
  }
> {
  return {
    StatementRenderer({ statement: { question, options }, onAttempt }) {
      return (
        <div>
          <ReactMarkdown source={question} />
          <ul>
            {options.map(answer => (
              <li onClick={() => onAttempt(answer)}>
                <AnswerRenderer answer={answer} />
              </li>
            ))}
          </ul>
        </div>
      );
    },

    async evaluate({ answer, statement: { options, correctIndex } }) {
      const ok = options.indexOf(answer) === correctIndex;
      return {
        result: ok,
        passed: ok
      };
    },

    ResultRenderer({ result }) {
      return <div>Your answer is: {result ? "correct" : "incorrect"}</div>;
    }
  };
}

export const markdownMultipleChoice = makeMultipleChoiceExerciseType<markdown>(
  ({ answer }) => (
    <div>
      <ReactMarkdown source={answer} />
    </div>
  )
);
